using System;
using System.Diagnostics;
using System.IO;

namespace PolicySanityChecker
{
    public class Program
    {
        private static string GetFeatureRootPath(string branch)
        {
            return $@"C:\TFS\Grange Commercial SEQ\{branch}\Specifications\SEQ";
        }
        public static void Main(string[] args)
        {
            var arguments = CrudelyParseArgs(args);
            Console.WriteLine($"Running {arguments.Symbol}-{arguments.Number} mod {arguments.Mod} {arguments.MasterCompany}.");
            BuildFeature(arguments);
            RunFeature(arguments);
        }

        private static void BuildFeature(MyArguments args)
        {
            var featureText = File.ReadAllText(Path.Combine(GetFeatureRootPath(args.Branch), @"features\CPP\common_pages\automatic_pif_policy_runner_template.feature"));
            featureText = featureText.Replace("<mco>", args.MasterCompany)
                .Replace("<policy_number>", args.Number)
                .Replace("<symbol>", args.Symbol)
                .Replace("<mod>", args.Mod);
            File.WriteAllText(Path.Combine(GetFeatureRootPath(args.Branch), @"features\CPP\common_pages\automatic_pif_policy_runner.feature"), featureText);
        }

        private static void RunFeature(MyArguments args)
        {
            var c = $@"exec cucumber -p {args.Profile} features\CPP\common_pages\automatic_pif_policy_runner.feature BROWSER=chrome";
            var psi = new ProcessStartInfo(@"C:\RailsInstaller\Ruby1.9.3\bin\bundle.bat", c);
            psi.RedirectStandardOutput = true;
            psi.RedirectStandardError = true;
            psi.WorkingDirectory = GetFeatureRootPath(args.Branch);
            var proc = Process.Start(psi);
            var output = proc.StandardOutput.ReadToEnd();
            var error = proc.StandardError.ReadToEnd();
            proc.WaitForExit();
            Console.WriteLine(string.IsNullOrWhiteSpace(output) ? error : output);
            var result = new TestResult 
                {
                    Symbol = args.Symbol,
                    PolicyNumber = args.Number,
                    Mod = args.Mod,
                    MasterCompany = args.MasterCompany,
                    PCName = Environment.MachineName,
                    Output = string.IsNullOrWhiteSpace(output) ? error : output,
                    Fail = proc.ExitCode != 0,
                    Pass = proc.ExitCode == 0,
                    IsErrorOutput = string.IsNullOrWhiteSpace(output),
                    Completed = DateTime.Now
                };
            result.SetDetails();
            new ResultLogger().Log(result);
        }

        private static MyArguments CrudelyParseArgs(string[] args)
        {            
            return new MyArguments
            {
                Number = args[Array.IndexOf(args, "-policy") + 1].Trim(),
                Symbol = args[Array.IndexOf(args, "-symbol") + 1].Trim(),
                Mod = args[Array.IndexOf(args, "-mod") + 1].Trim(),
                MasterCompany = args[Array.IndexOf(args, "-mastercompany") + 1].Trim(),
                Region = args[Array.IndexOf(args, "-region") + 1].Trim(),
                Branch = args[Array.IndexOf(args, "-branch") + 1].Trim(),
                Profile = args[Array.IndexOf(args, "-profile") + 1].Trim()
            };
        }
    }

    public class MyArguments
    {
        public string Number { get; set; }
        public string Symbol { get; set; }
        public string Mod { get; set; }
        public string MasterCompany { get; set; }
        public string Region { get; set; }
        public string Branch { get; set; }
        public string Profile { get; set; }
    }
}
