import Editor from "@monaco-editor/react";

const CodeEditor = ({ code, setCode, language, disabled }) => {
  return (
    <Editor
      height="420px"
      language={language}
      value={code}
      theme="vs-dark"
      onChange={(value) => {
        if (!disabled) setCode(value);
      }}
      options={{
        readOnly: disabled,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14
      }}
    />
  );
};

export default CodeEditor;
