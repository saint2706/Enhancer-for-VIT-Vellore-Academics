chrome.runtime.onMessage.addListener( ( request ) =>
{
  console.log(
    "Contentscript has received a message from from background script: '" +
    request.message +
    "'"
  )
} )
