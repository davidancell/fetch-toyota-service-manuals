import commandLineArgs from "command-line-args";
import commandLineUsage from "command-line-usage";

export interface CLIArgs {
  manual: string[];
  email: string;
  password: string;
  headed: boolean;
  cookieString?: string;
  browserLogin: boolean;
}

export default function processCLIArgs(): CLIArgs {
  const optionConfig = [
    {
      name: "manual",
      alias: "m",
      type: String,
      multiple: true,
    },
    {
      name: "email",
      alias: "e",
      type: String,
    },
    {
      name: "password",
      alias: "p",
      type: String,
    },
    {
      name: "headed",
      alias: "h",
      type: Boolean,
      defaultOption: false,
    },
    {
      name: "cookie-string",
      alias: "c",
      type: String,
    },
    {
      name: "browser-login",
      alias: "b",
      type: Boolean,
      defaultOption: false,
    },
    {
      name: "help",
      type: Boolean,
    },
  ];

  const sections = [
    {
      header: "Toyota/Lexus/Scion Workshop Manual Downloader",
      content:
        "Download the full workshop manual for your car. Must have a valid TIS subscription.",
    },
    {
      header: "Options",
      optionList: [
        {
          name: "manual -m",
          typeLabel: "{underline RM12345}",
          description:
            "{bold Required.} Manual ID(s) to download. Use multiple times for multiple manuals. For non-electrical manuals, add @YEAR to the end to only download pages for that year.",
        },
        {
          name: "browser-login -b",
          typeLabel: " ",
          description:
            "{bold Recommended for 2FA.} Opens a browser window where you can manually log in (including 2FA), then automatically extracts cookies.",
        },
        {
          name: "email -e",
          typeLabel: "{underline me@example.com}",
          description: "Your TIS email. {bold Note:} May not work with 2FA enabled. Use --browser-login instead.",
        },
        {
          name: "password -p",
          typeLabel: "{underline abc1234}",
          description: "Your TIS password. {bold Note:} May not work with 2FA enabled. Use --browser-login instead.",
        },
        {
          name: "cookie-string -c",
          typeLabel: "{underline abc1234}",
          description:
            "Your TIS cookie string. Advanced option - if you manually extracted cookies from browser.",
        },
        {
          name: "headed -h",
          typeLabel: " ",
          description: "Run in headed mode (show the emulated browser during downloads).",
        },
        {
          name: "help",
          typeLabel: " ",
          description: "Print this usage guide.",
        },
      ],
    },
  ];

  const usage = commandLineUsage(sections);

  try {
    const options = commandLineArgs(optionConfig);
    if (options.help) {
      console.log(usage);
      process.exit(0);
    }

    if (
      !options.manual ||
      ((!options.email || !options.password) && !options["cookie-string"] && !options["browser-login"])
    ) {
      console.error("Missing required args!");
      // console.log(options);

      console.log(usage);
      process.exit(1);
    }
    return {
      manual: options.manual,
      email: options.email,
      password: options.password,
      headed: options.headed,
      cookieString: options["cookie-string"],
      browserLogin: options["browser-login"],
    };
  } catch (e: any) {
    console.error(e);
    console.log(usage);
    process.exit(1);
  }
}
