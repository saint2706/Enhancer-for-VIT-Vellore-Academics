// Listener for messages from background

function setTheme ( number )
{
  let url = chrome.runtime.getURL(
    "styles/general/dark_" + number.toString() + ".css"
  )
  while ( true )
  {
    if (
      document.head.lastChild.href &&
      document.head.lastChild.href.startsWith( "chrome" )
    )
    {
      document.head.lastChild.remove()
    } else
    {
      break
    }
  }
  let link = document.createElement( "link" )
  link.setAttribute( "rel", "stylesheet" )
  link.setAttribute( "type", "text/css" )
  document.head.appendChild( link )
  link.setAttribute( "href", url )

  url = chrome.runtime.getURL( "styles/font/font.css" )
  link = document.createElement( "link" )
  link.setAttribute( "rel", "stylesheet" )
  link.setAttribute( "type", "text/css" )
  document.head.appendChild( link )
  link.setAttribute( "href", url )
}

chrome.runtime.onMessage.addListener( ( request, sender, sendResponse ) =>
{
  if ( request.message.startsWith( "style" ) )
  {
    const index = request.message.split( "style:" )[ 1 ]
    setTheme( index )
    chrome.storage.local.set( { currentTheme: index } )
  }

  if ( request.from )
  {
    alert( request.message )
  }
} )

chrome.storage.local.get( [ "currentTheme" ], function ( result )
{
  console.log( "result found", result )
  if ( result && result.currentTheme ) setTheme( result.currentTheme )
} )
