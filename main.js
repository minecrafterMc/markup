const input = document.getElementById("textbox");
const output = document.getElementById("out");
const htmlOut = document.getElementById("htmlOut");

function appendMarkedText(str, parent) {
  parent.innerHTML = convertText(str).replace(/(?<!\\)\|/g, "<br>");
  let codeBlocks = document.getElementsByClassName("codeBlock");
  for (let i = 0; i < codeBlocks.length; i++) {
    codeBlocks[i].innerHTML = codeBlocks[i].innerHTML.replaceAll(
      "###[NEW LINE]###",
      "\n"
    );
    
    Prism.highlightElement(codeBlocks[i]);
    codeBlocks[i].innerHTML = codeBlocks[i].innerHTML.replaceAll("___STARTOFTAG___","&lt;");
    codeBlocks[i].innerHTML = codeBlocks[i].innerHTML.replaceAll("___ENDOFTAG___","&gt;");
    codeBlocks[i].style.borderRadius = "20px";
  }
}

function convertText(str) {
  let openStrong = false;
  let openItalic = false;
  let openUnder = false;
  let openBig = false;
  let endWithLine = true;
  let breakNext = false;
  let endNext = true;
  let codeBlock = false;
  let lines = str.split("\n");
  let result = "";
  let codeElements = "";
  let configuration;
  for (let i = 0; i < lines.length; i++) {
    let currentLine = lines[i].split("");
    if (currentLine[0] == "@" && currentLine[1] == "C") {
      if (!codeBlock) {
        codeBlock = true;
        configuration = lines[i].split(";");
        continue;
      } else {
        codeBlock = false;
        result += "<pre class=' ";
        if (configuration.includes("useLines")) {
          result += " line-numbers";
        }
        if (!configuration.includes("borderless")) {
          result += " codeBlockBorder";
        }
        if (!configuration.includes("dontMatchBraces")) {
          result += " match-braces";
        }
        result +=
          "'><code class='codeBlock language-" + configuration[1] + "' ";
        result += ">";
        result += codeElements.replaceAll("<br>", "###[NEW LINE]###").replaceAll("<","___STARTOFTAG___").replaceAll(">","___ENDOFTAG___");
        result += "</code></pre>";
        codeElements = "";
        continue;
      }
    }
    if (currentLine[0] == "@") {
      endNext = false;
    }
    for (let j = 0; j < currentLine.length; j++) {
      if (!breakNext && !codeBlock) {
        if (j == 0 && !endNext) {
          j++;
        }
        switch (currentLine[j]) {
          case "#":
            if (!openStrong) {
              result += "<strong>";
              openStrong = true;
            } else {
              result += "</strong>";
              openStrong = false;
            }
            break;
          case "/":
            if (!openItalic) {
              result += "<i>";
              openItalic = true;
            } else {
              result += "</i>";
              openItalic = false;
            }
            break;
          case "_":
            if (!openUnder) {
              result += "<u>";
              openUnder = true;
            } else {
              result += "</u>";
              openUnder = false;
            }
            break;
          case "^":
            if (!openBig) {
              result += "<h1>";
              openBig = true;
            } else {
              result += "</h1>";
              openBig = false;
            }
            break;
          case "\\":
            breakNext = true;
            break;
          case "!":
            if (endWithLine) {
              endWithLine = false;
            } else {
              endWithLine = true;
            }
            break;
          case undefined:
            result += "[Error: don't use empty special lines]";
            break;
          default:
            result += currentLine[j];
            break;
        }
      } else if (!codeBlock) {
        result += currentLine[j];
        breakNext = false;
      } else {
        codeElements += currentLine[j];
      }
    }
    if (endWithLine) {
      if (openUnder) {
        result += "</u>";
        openUnder = false;
      }
      if (openItalic) {
        result += "</i>";
        openItalic = false;
      }
      if (openStrong) {
        result += "</strong>";
        openStrong = false;
      }
      if (openBig) {
        result += "</h1>";
        openBig = false;
      }
    }
    if (endNext && !codeBlock) {
      result += "|";
    }
    if (endNext && codeBlock) {
      codeElements += "###[NEW LINE]###";
    }
    endNext = true;
  }
  return result;
}
input.addEventListener("keyup", () => {
  appendMarkedText(input.value, output);
  htmlOut.textContent = output.innerHTML;
});
