package com.cdocweb;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.io.File;
import java.io.FileWriter;


import static spark.Spark.get;
import static spark.Spark.port;
import static spark.Spark.post;

public class App 
{
    public static void main( String[] args )
    {
        port(4444);

        post("/cdoc", (request, response) -> {
            String jarArgs = request.body();
            String[] argParts = jarArgs.split("&");
            String nameFrom = argParts[0];
            String nameTo = argParts[1];
            String idCode = argParts[2];
            
            String jarPath = "/app/cdoc_jar/target/cdoc.jar";
            String sharedDir = "/app/cdoc_files/";
            String fileName = nameFrom+".txt";

            try {
                File plain = new File(fileName);
                if (!plain.createNewFile()) {
                    System.out.println("File creation failed");
                }
                FileWriter writer = new FileWriter(fileName);
                writer.write(nameTo);
                writer.close();

                ProcessBuilder encrypt = new ProcessBuilder(
                        "java", "-jar", jarPath, fileName, idCode);
                encrypt.redirectErrorStream(true);
                Process process = encrypt.start();

                StringBuilder output = new StringBuilder();
                try (BufferedReader reader = new BufferedReader(
                        new InputStreamReader(process.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        output.append(line).append("\n");
                    }
                }
                int exitCode = process.waitFor();
                
                plain.delete();
                Files.move(Paths.get(fileName+".cdoc"), Paths.get("cdoc_files/"+nameFrom+".cdoc"));
                
                if (exitCode == 0) {
                    response.status(200);
                    return "JAR executed successfully:\n" + output.toString();
                } else {
                    response.status(500);
                    return "Error running JAR:\n" + output.toString();
                }
            } catch (Exception e) {
                response.status(500);
                return "Exception occurred: " + e.getMessage();
            }
        });

        // Health check endpoint
        get("/health", (req, res) -> "API is up and running!");
    }
}
