package org.cdoc4j.cli;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.GeneralSecurityException;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;

import org.cdoc4j.CDOC;
import org.cdoc4j.CDOCBuilder;
import org.esteid.sk.IDCode;
import org.esteid.sk.LDAP;

import static spark.Spark.get;
import static spark.Spark.port;
import static spark.Spark.post;




public class Tool {


    public static void main(String[] args) {
        port(Integer.valueOf(System.getenv("CDOC_PORT")));

        post("/cdoc", (request, response) -> {
            String jarArgs = request.body();
            String[] argParts = jarArgs.split("&");
            String nameFrom = argParts[0];
            String nameTo = argParts[1];
            String idCode = argParts[2];
            
            String fileName = nameFrom+".txt";

            try {
                File plain = new File(fileName);
                if (!plain.createNewFile()) {
                    System.out.println("File creation failed");
                }
                FileWriter writer = new FileWriter(fileName);
                writer.write(nameTo);
                writer.close();

                String encryptedData = encrypt(fileName, idCode);
                
                plain.delete();
                
                response.status(200);
                return encryptedData;

            } catch (Exception e) {
                response.status(500);
                return "Exception occurred: " + e.getMessage();
            }
        });

        // Health check endpoint
        get("/health", (req, res) -> "API is up and running!");
    }

    public static String encrypt(String fileName, String idCode) throws Exception {

        try {
            // The total list of certificates to encrypt against.
            HashSet<X509Certificate> recipients = new HashSet<>();

            List<Path> files = new ArrayList<>();
            HashSet<String> codes = new HashSet<>();

            Path f = Paths.get(fileName);
            if (Files.isRegularFile(f)) {
                files.add(f);
            } else {
                fail(fileName + " is not a valid file");
            }

            if (IDCode.check(idCode)) {
                codes.add(idCode);
            } else {
                fail(idCode + " is not a valid id code");
            }

            // Resolve certificates from LDAP
            for (String code : codes) {
                Collection<X509Certificate> c = LDAP.fetch(code);
                if (!c.isEmpty()) {
                    // Always filter LDAP certs
                    Collection<X509Certificate> uc = filter_crypto_certs(c);
                    recipients.addAll(uc);
                }
            }


            if (recipients.isEmpty()) {
                fail("must specify recipients for encryption");
            }

            // Check if -o is present
            final File outfile;
            // Single file
            String fn = files.get(0).getFileName() + ".cdoc";
            outfile = new File(fn);


            if (outfile.exists())
                fail("Output file " + outfile + " already exists");

            CDOCBuilder cdoc = CDOC.builder();

            // Recipients
            for (X509Certificate r : recipients) {
                cdoc.addRecipient(r);
            }

            // Source files
            for (Path p : files) {
                cdoc.addPath(p);
            }

            // Shoot
            ByteArrayOutputStream stream = new ByteArrayOutputStream();
            cdoc.buildToStream(stream);
            String res = new String(stream.toByteArray());
            System.out.println("Encryption function success");
            return res;
        } catch (IOException e) {
            fail("I/O Error: " + e.getMessage());
        } catch (IllegalStateException e) {
            fail("Can not run: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            fail("Illegal argument: " + e.getMessage());
        } catch (GeneralSecurityException e) {
            fail("General security error: " + e.getMessage());
        }
        return "Encryption failed";
    }

    // XXX: This is highly Estonia specific
    static Collection<X509Certificate> filter_crypto_certs(Collection<X509Certificate> certs) {
        ArrayList<X509Certificate> result = new ArrayList<>();
        for (X509Certificate c : certs) {
            String s = c.getSubjectX500Principal().toString();
            // Skip non-repudiation
            if (c.getKeyUsage()[1])
                continue;
            // Skip Mobile ID
            if (s.contains("MOBIIL-ID"))
                continue;
            result.add(c);
        }
        return result;
    }

    static void fail(String message) {
        System.err.println("Error: " + message);
        System.exit(1);
    }
}
