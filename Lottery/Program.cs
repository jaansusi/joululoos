using Newtonsoft.Json;
using Novell.Directory.Ldap;
using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace Jõululoos
{
    class Program
    {
        static void Main(string[] args)
        {
            //using (var cn = new LdapConnection())
            //{
            //    //ldap://ldap.sk.ee:389/ou=Authentication,o=ESTEID,c=EE??sub?(serialNumber=47101010033)
            //    Console.WriteLine("Connecting..");
            //    //connect
            //    cn.SecureSocketLayer = true;
            //    cn.Connect("esteid.ldap.sk.ee", 636);
            //    Console.WriteLine("Connected");
            //    Console.WriteLine("Searching..");
            //    var a = cn.Search("c=EE", LdapConnection.SCOPE_SUB, "(serialNumber=PNOEE-39401262728)", null, false);
            //    Console.WriteLine("Found? ");

            //    while (a.hasMore())
            //    {
            //        try
            //        {

            //            var entry = a.next();
            //            var attr = entry.getAttributeSet();
            //            var cert = entry.getAttribute("USERCERTIFICATE;BINARY");
            //            File.WriteAllBytes("./bytes.crt", (byte[])cert.ByteValue.Cast<byte>());
            //            File.WriteAllText("./string.crt", cert.StringValue);
            //            Console.WriteLine(entry.DN);
            //        }
            //        catch (Exception ex)
            //        {
            //            Console.WriteLine(ex.Message);
            //        }
            //    }
            //}
            //Console.WriteLine("End");
            //Console.ReadLine();
            //return;


            bool gotAnswer = false;
            bool testRun = true;
            Console.WriteLine("Is this a test run?");
            do
            {
                Console.Write("Y/N: ");
                string answer = Console.ReadLine();
                if (!string.IsNullOrEmpty(answer))
                gotAnswer = answer.Equals("Y", StringComparison.InvariantCultureIgnoreCase) || answer.Equals("N", StringComparison.InvariantCultureIgnoreCase);
                if (gotAnswer)
                    testRun = answer.Equals("Y", StringComparison.InvariantCultureIgnoreCase);
            } while (!gotAnswer);


            bool done = false;
            List<Family> families = new List<Family>();
            do
            {
                try
                {
                    Directory.CreateDirectory(@".\Loos");
                    foreach (FileInfo file in new DirectoryInfo(@".\Loos\").GetFiles())
                        file.Delete();
                    using (StreamReader r = new StreamReader("data.json"))
                    {
                        string json = r.ReadToEnd();
                        families = JsonConvert.DeserializeObject<List<Family>>(json).OrderBy(x => Guid.NewGuid()).ToList();
                    }

                    for (int i = 0; i < families.Count; i++)
                    {
                        Family currentFamily = families[i];
                        IEnumerable<Family> otherFamilies = families.Where(x => x.Id != currentFamily.Id);
                        foreach (Person person in currentFamily.Members)
                        {
                            //Assuming that this person is not gifting to anyone!

                            //Get people that are not getting a gift from anyone, random them up
                            List<Person> personsWithoutIsGiftedTo = otherFamilies
                                                                    .SelectMany(x => x.Members)
                                                                    .Where(x => !x.IsGiftedTo)
                                                                    .OrderBy(x => Guid.NewGuid())
                                                                    .ToList();
                            Person giftingTo = personsWithoutIsGiftedTo.First();
                            person.GiftingTo = giftingTo;
                            giftingTo.IsGiftedTo = true;
                            
                        }
                    }
                    done = true;
                    families.SaveToFiles();
                }
                catch (Exception ex)
                {
                    if (ex is InvalidOperationException)
                    {
                        //All good, this exception is expected sometimes, let's try again!
                        if (testRun)
                        {
                            foreach (Person person in families.SelectMany(x => x.Members))
                                Console.WriteLine(person.Name + " - " + person.GiftingTo?.Name);

                            Console.WriteLine("Seems that we didn't find a solution, let's try again!");
                        }
                    }
                    else
                    {
                        Console.WriteLine(ex.Message);
                        Console.WriteLine(ex.StackTrace);
                    }
                }
            } while (!done);
            Console.WriteLine("Seems we have a solution!");
            Console.WriteLine();
            Console.WriteLine("Let's doublecheck that everyone will get a present from someone else!");
            bool testResult = true;
            HashSet<string> giftingToSet = new HashSet<string>();
            HashSet<string> giftingFromSet = new HashSet<string>();
            foreach (Person person in families.SelectMany(x => x.Members))
            {
                if (testRun)
                    Console.WriteLine(person.Name + " - " + person.GiftingTo.Name);
                giftingToSet.Add(person.GiftingTo.Name);
                giftingFromSet.Add(person.Name);
                if (person.Name.Equals(person.GiftingTo.Name))
                {
                    Console.WriteLine($"Something went wrong, {person.Name} is gifting to themself!");
                    testResult = false;
                }
            }
            int personsAmount = families.SelectMany(x => x.Members).Count();
            if (testResult)
                testResult = personsAmount == giftingToSet.Count && giftingToSet.Count == giftingFromSet.Count;

            if (testResult)
                Console.WriteLine("All good, send these out!");
            else
                Console.WriteLine("Something went wrong, check the files!");
            Console.ReadLine();
        }
    }
}
