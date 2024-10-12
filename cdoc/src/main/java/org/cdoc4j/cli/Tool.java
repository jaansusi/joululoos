/*
 * Copyright (C) 2017 Martin Paljak <martin@martinpaljak.net>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package org.cdoc4j.cli;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.AccessDeniedException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.GeneralSecurityException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.crypto.Cipher;

import org.cdoc4j.CDOC;
import org.cdoc4j.CDOCBuilder;
import org.cdoc4j.Recipient;
import org.esteid.sk.IDCode;
import org.esteid.sk.LDAP;

import joptsimple.OptionException;
import joptsimple.OptionParser;
import joptsimple.OptionSet;
import joptsimple.OptionSpec;
import joptsimple.util.PathConverter;
import joptsimple.util.PathProperties;



public class Tool {
    private static final String OPT_VERSION = "version";
    private static final String OPT_OUT = "out";
    private static final String OPT_DEBUG = "debug";
    private static final String OPT_VERBOSE = "verbose";
    private static final String OPT_FORCE = "force";
    private static final String OPT_RECIPIENT = "receiver";
    private static final String OPT_LIST = "list";


    private static OptionSet args = null;

    public static void main(String[] argv) throws Exception {
        OptionParser parser = new OptionParser();

        // Generic options
        parser.acceptsAll(Arrays.asList("V", OPT_VERSION), "Show version");
        parser.acceptsAll(Arrays.asList("?", "help"), "Show this help");
        parser.acceptsAll(Arrays.asList("v", OPT_VERBOSE), "Be verbose");
        parser.acceptsAll(Arrays.asList("o", OPT_OUT), "Save output to").withRequiredArg().withValuesConvertedBy(new PathConverter());
        parser.acceptsAll(Arrays.asList("l", OPT_LIST), "List recipients");

        // Type safety
        OptionSpec<Path> recipient_pems = parser.acceptsAll(Arrays.asList("r", OPT_RECIPIENT), "Receiver cert").withRequiredArg().withValuesConvertedBy(new PathConverter(PathProperties.FILE_EXISTING));
        // The rest
        OptionSpec<String> others = parser.nonOptions("files and ID-codes");

        // Parse arguments
        try {
            args = parser.parse(argv);
            if (args.has("help")) {
                parser.printHelpOn(System.out);
                System.exit(0);
            }
        } catch (OptionException e) {
            if (e.getCause() != null) {
                System.err.println(e.getMessage() + ": " + e.getCause().getMessage());
            } else {
                System.err.println(e.getMessage());
            }
            System.err.println();
            parser.printHelpOn(System.err);
            System.exit(1);
        }

        try {
            // Test for unlimited crypto
            if (Cipher.getMaxAllowedKeyLength("AES") == 128) {
                System.err.println("WARNING: Unlimited crypto policy is NOT installed!");
                if (System.getProperty("java.vendor").contains("Oracle")) {
                    String jv = System.getProperty("java.version");
                    if (jv.startsWith("1.8")) {
                        String[] jvb = jv.split("_");
                        if (jvb.length == 2 && Integer.parseInt(jvb[1]) >= 151) {
                            String jh = System.getProperty("java.home");
                            System.err.println("Trying to fix automatically for " + jh + " ...");
                            Path sf = Paths.get(jh, "lib", "security", "java.security");
                            Path sftmp = Paths.get(jh, "lib", "security", "java.security.tmp");
                            Path sfbak = Paths.get(jh, "lib", "security", "java.security.bak");
                            try {
                                List<String> lines = Files.readAllLines(sf);
                                lines.add("crypto.policy=unlimited");
                                Files.write(sftmp, lines);
                                Files.copy(sf, sfbak, StandardCopyOption.REPLACE_EXISTING);
                                Files.move(sftmp, sf, StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING);
                            } catch (AccessDeniedException e) {
                                System.err.println("FAILED: Access denied.");
                                System.err.println("Please run cdoc with sudo to automatically fix the problem by modifying:");
                                System.err.println();
                                System.err.println(sf);
                                System.err.println();
                                System.err.println("More information: https://github.com/martinpaljak/cdoc/wiki/UnlimitedCrypto");
                                System.exit(2);
                            }
                        } else {
                            System.err.println("Please upgrade to Java 8 Update 151 or later");
                            System.err.println("More information: https://github.com/martinpaljak/cdoc/wiki/UnlimitedCrypto");
                            System.exit(2);
                        }
                    }
                }
            }

            if (args.has(OPT_VERBOSE)) {
                System.setProperty("org.slf4j.simpleLogger.defaultLogLevel", "info");
            }

            if (args.has(OPT_DEBUG)) {
                System.setProperty("org.slf4j.simpleLogger.defaultLogLevel", "trace");
            }

            if (args.has(OPT_VERSION)) {
                System.out.println("# CDOC " + getVersion() + " with cdoc4j/" + CDOC.getLibraryVersion());
                System.out.println("# " + System.getProperty("java.version") + " by " + System.getProperty("java.vendor"));
            }

            // Add allowed issuers
            HashSet<X509Certificate> issuers = new HashSet<>();

            issuers.addAll(get_builtin_issuers());


            // List issuers if asked
            for (X509Certificate issuer : issuers) {
                verbose("Allowed issuer: " + issuer.getSubjectDN());
            }

            // The total list of certificates to encrypt against.
            HashSet<X509Certificate> recipients = new HashSet<>();

            // Handle recipients from explicit command line
            if (args.has(OPT_RECIPIENT)) {
                for (Path pem : recipient_pems.values(args)) {
                    CertificateFactory fact = CertificateFactory.getInstance("X.509");
                    try (InputStream in = Files.newInputStream(pem)) {
                        X509Certificate recipient = (X509Certificate) fact.generateCertificate(in);
                        recipients.add(recipient);
                    }
                }
            }

            List<String> rest = args.valuesOf(others);
            List<Path> files = new ArrayList<>();
            HashSet<String> codes = new HashSet<>();
            for (String arg : rest) {
                Path f = Paths.get(arg);
                if (Files.isRegularFile(f)) {
                    files.add(f);
                } else if (IDCode.check(arg)) {
                    codes.add(arg);
                } else {
                    fail(arg + " is not a file nor ID-code!");
                }
            }

            // One-shot ops
            if (args.has(OPT_LIST)) {
                for (Path p : files) {
                    File f = p.toFile();
                    CDOC c = CDOC.open(f);
                    System.out.println(f.getName() + ": " + c.getVersion() + " with " + c.getAlgorithm());
                    for (Recipient r : c.getRecipients()) {
                        System.out.println("Encrypted for: " + (r.getName() == null ? "undisclosed recipient" : r.getName()) + " (" + r.getType() + ")");
                    }
                }
            }

            // Minimal
            if (files.isEmpty() && !args.has(OPT_VERSION)) {
                fail("Need files to encrypt!");
            }

            // Resolve certificates from LDAP
            for (String code : codes) {
                Collection<X509Certificate> c = LDAP.fetch(code);
                if (args.has(OPT_VERBOSE) || c.isEmpty())
                    verbose("LDAP returned " + c.size() + " certificates for " + code);
                if (!c.isEmpty()) {
                    // Always filter LDAP certs
                    Collection<X509Certificate> uc = filter_crypto_certs(c);
                    verbose(uc.size() + " certificates are usable for encryption");
                    recipients.addAll(uc);
                } else {
                    if (!args.has(OPT_FORCE)) {
                        fail("LDAP returned no certificates for " + code);
                    } else {
                        System.err.println("Removing " + code + " from recipients, no certificates");
                    }
                }
            }

            for (X509Certificate c : recipients) {
                verbose("Encrypting for " + c.getSubjectDN());
            }


            if (recipients.isEmpty()) {
                fail("must specify recipients for encryption");
            }

            // Check if -o is present
            final File outfile;
            // Single file
            String fn = files.get(0).getFileName() + ".cdoc";
            if (args.has(OPT_OUT)) {
                File o = ((Path) args.valueOf(OPT_OUT)).toFile();
                if (o.isDirectory()) {
                    outfile = new File(o, fn);
                } else {
                    outfile = o;
                }
            } else {
                outfile = new File(fn);
            }

            if (outfile.exists() && !args.has(OPT_FORCE))
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
            cdoc.buildToStream(Files.newOutputStream(outfile.toPath()));
            System.out.println("Saved encrypted file to " + outfile);
            System.exit(0);
        } catch (IOException e) {
            fail("I/O Error: " + e.getMessage());
        } catch (IllegalStateException e) {
            fail("Can not run: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            fail("Illegal argument: " + e.getMessage());
        }
    }

    static String getVersion() {
        String version = "unknown-development";
        try (InputStream versionfile = Tool.class.getResourceAsStream("pro_version.txt")) {
            if (versionfile != null) {
                try (BufferedReader vinfo = new BufferedReader(new InputStreamReader(versionfile, StandardCharsets.UTF_8))) {
                    version = vinfo.readLine();
                }
            }
        } catch (IOException e) {
            version = "unknown-error";
        }
        return version;
    }

    /**
     * Return a list of hard-coded X509 certificates
     */
    static Set<X509Certificate> get_builtin_issuers() {
        Set<X509Certificate> s = new HashSet<>();
        String[] builtins = new String[]{"ESTEID-SK_2011.pem.crt", "ESTEID-SK_2015.pem.crt", "esteid2018.pem.crt"};
        for (String c : builtins) {
            try (InputStream i = Tool.class.getResourceAsStream(c)) {
                CertificateFactory fact = CertificateFactory.getInstance("X.509");
                s.add((X509Certificate) fact.generateCertificate(i));
            } catch (GeneralSecurityException | IOException e) {
                throw new RuntimeException("Could not load built-in issuers", e);
            }
        }
        return s;
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


    static void verbose(String s) {
        if (args.has(OPT_VERBOSE))
            System.out.println(s);
    }

    static void fail(String message) {
        System.err.println("Error: " + message);
        System.exit(1);
    }
}
