// Once the DOM is ready...
window.addEventListener( "DOMContentLoaded", function ()
{
  document.getElementById( "themeSet" ).onclick = function ()
  {
    for ( let i of document.getElementsByName( "themeSelect" ) )
    {
      if ( i.checked )
      {
        chrome.tabs.query(
          { active: true, currentWindow: true },
          function ( tabs )
          {
            chrome.tabs.sendMessage( tabs[ 0 ].id, {
              message: "style:" + i.value,
            } )
          }
        )
        break
      }
    }
  }
} )
