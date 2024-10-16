package com.cdocweb;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Paths;


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
            
            String jarPath = "/app/cdoc_jar/target/cdoc.jar";

            try {
                ProcessBuilder encrypt = new ProcessBuilder(
                        "java", "-jar", jarPath, argParts[0], argParts[1]);
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
                
                Files.move(Paths.get(argParts[2]+".txt.cdoc"), Paths.get("cdoc_files/"+argParts[2]+".txt.cdoc"));
                
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
