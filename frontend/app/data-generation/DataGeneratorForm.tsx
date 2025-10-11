
const [fileUrl, setFileUrl] = React.useState<string>("")
const [fileContent, setFileContent] = React.useState<string>("")


// Load from localStorage on mount
React.useEffect(() => {
  const savedUrl = localStorage.getItem("fileUrl")
  const savedContent = localStorage.getItem("fileContent")
  if (savedUrl) setFileUrl(savedUrl)
  if (savedContent) setFileContent(savedContent)
}, [])

// Save whenever it changes
React.useEffect(() => {
  if (fileUrl) localStorage.setItem("fileUrl", fileUrl)
  if (fileContent) localStorage.setItem("fileContent", fileContent)
}, [fileUrl, fileContent])
