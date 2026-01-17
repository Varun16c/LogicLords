const axios = require("axios");

const languageMap = {
  javascript: 63,
  python: 71,
  cpp: 54,
  c: 50,
  java: 62
};

exports.runCode = async (req, res) => {
  let { code, language, input } = req.body;

  try {
    // -------- JAVA FIX (PROPER & SAFE) --------
    if (language === "java") {
      // If user already wrote a class, rename it to Main
      if (code.includes("class")) {
        code = code.replace(/public\s+class\s+\w+/, "public class Main");
      } 
      // If user wrote only statements, wrap them
      else {
        code = `
public class Main {
    public static void main(String[] args) throws Exception {
        ${code}
    }
}
`;
      }
    }

    const submission = await axios.post(
      "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
      {
        source_code: code,
        stdin: input,
        language_id: languageMap[language]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
          "X-RapidAPI-Host": process.env.JUDGE0_API_HOST
        }
      }
    );

    const { stdout, stderr, compile_output } = submission.data;

    let output = "";
    if (compile_output) output = compile_output;
    else if (stderr) output = stderr;
    else output = stdout || "No output";

    res.json({ output });
  } catch (error) {
    console.error(error.message);
    res.json({
      output: "Internal server error while executing code"
    });
  }
};
