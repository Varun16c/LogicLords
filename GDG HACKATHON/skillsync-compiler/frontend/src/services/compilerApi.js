import axios from "axios";

export const runCode = async (code, language, input) => {
  try {
    console.log('Running code:', { language, codeLength: code?.length, inputLength: input?.length });
    
    const res = await axios.post("http://localhost:5000/run", {
      code,
      language,
      input
    });

    console.log('Code execution result:', res.data);
    return res.data.output || "No output";
  } catch (error) {
    console.error('Code execution error:', error);
    
    if (error.response) {
      // Server responded with error
      return `Server Error: ${error.response.data?.output || error.response.data?.error || 'Unknown error'}`;
    } else if (error.request) {
      // Request made but no response
      return "Network Error: Could not reach the compiler server";
    } else {
      // Something else happened
      return `Error: ${error.message}`;
    }
  }
};