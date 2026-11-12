const codeBlock = document.querySelector("#code")
codeBlock.value = 
`backgroundColor = { r: 0.7, g: 0.7, b: 1.0 }
`

function onShowButtonPress(){
  let userCodeStr = codeBlock.value
  localStorage.setItem("code", userCodeStr)
  location.href = "spinning.html"
}