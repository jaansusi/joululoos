package com.cdocweb;

import java.io.BufferedReader;
import java.io.InputStreamReader;

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
                ProcessBuilder processBuilder = new ProcessBuilder(
                        "java", "-jar", jarPath, argParts[0], argParts[1]);
                processBuilder.redirectErrorStream(true);
                System.out.println(String.join(" ",processBuilder.command().toArray(new String[0])));
                Process process = processBuilder.start();

                StringBuilder output = new StringBuilder();
                try (BufferedReader reader = new BufferedReader(
                        new InputStreamReader(process.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        output.append(line).append("\n");
                    }
                }
                int exitCode = process.waitFor();

                ProcessBuilder pb = new ProcessBuilder("mv", argParts[2]+".cdoc", "cdoc_files");
                pb.redirectErrorStream(true);
                System.out.println(String.join(" ",pb.command().toArray(new String[0])));
                Process p = pb.start();

                StringBuilder out = new StringBuilder();
                try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(p.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        out.append(line).append("\n");
                    }
                }
                p.waitFor();


                if (exitCode == 0) {
                    response.status(200);
                    return "JAR executed successfully:\n" + output.toString() + "\n" + out.toString();
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
