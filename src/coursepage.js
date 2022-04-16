/**
 * @module CoursePage
 */

let regNo

/**
 * @function triggerDownloads
 * @param {Object} downloads
 * @param {Object} downloads.linkData
 * @param {Object} downloads.course
 * @param {Object} downloads.facultySlotName
 * Sends message with download information to the background script
 */
const triggerDownloads = ( downloads ) =>
{
  chrome.extension.sendMessage( {
    message: downloads,
  } )
}

/**
 * @function getDownloadLink
 * @param {String} hrefContent href present in the checkboxes
 * @param {String} regNo Registration Number of the User
 */
const getDownloadLink = ( hrefContent, regNo ) =>
{
  const url = hrefContent.substring(
    hrefContent.indexOf( "'" ) + 1,
    hrefContent.lastIndexOf( "'" )
  )
  const now = new Date()
  const params =
    "authorizedID=" + regNo + "&x=" + encodeURIComponent( now.toUTCString() )
  return "https://vtop.vit.ac.in/vtop/" + url.trim() + "?" + params
}

/**
 * @function selectAllLinks
 * Selects all the valid links in the course page
 */
const selectAllLinks = () =>
{
  const checkedValue = document.getElementById( "selectAll" ).checked
  let checkbox = Array.from( document.querySelectorAll( ".sexy-input" ) )
  checkbox.forEach( ( boxes ) =>
  {
    boxes.checked = checkedValue
  } )
}

/**
 * @function getLinkInfo
 * @param {DOMElement} linkElement
 * @param {Number} index
 * retreives link information, and the title
 */
const getLinkInfo = ( linkElement, index ) =>
{
  if ( linkElement.outerText.indexOf( "_" ) === -1 )
  {
    const description =
      linkElement.parentNode.parentNode.previousElementSibling.innerText.trim()

    const date =
      linkElement.parentNode.parentNode.previousElementSibling.previousElementSibling.previousElementSibling.innerText.trim()

    let title = (
      ( index + 1 ).toString() +
      "-" +
      description +
      "-" +
      date
    ).replace( /[/:*?"<>|]/g, "_" )

    return { url: getDownloadLink( linkElement.href, regNo ), title: title }
  }

  return {
    url: getDownloadLink( linkElement.href, regNo ),
    title: ( index + 1 ).toString() + "-",
  }
}

/**
 * @function getCourseInfo
 * Returns the coursename and faculty details
 */
function getCourseInfo ()
{
  const detailsTable = document
    .querySelectorAll( ".table" )[ 0 ]
    .querySelectorAll( "td" )

  const course =
    detailsTable[ 8 ].innerText.trim() + "-" + detailsTable[ 9 ].innerText.trim()

  const facultySlotName = (
    detailsTable[ 12 ].innerText.trim() +
    "-" +
    detailsTable[ 13 ].innerText.trim()
  ).replace( /[/:*?"<>|]/g, "-" )

  return { course, facultySlotName }
}

const siblings = function ( el )
{
  if ( el.parentNode === null ) return []

  return [ ...el.parentNode.children ].filter( function ( child )
  {
    return child !== el
  } )
}

/**
 * @function downloadFiles
 * @param {String} type
 * accepted type: ["all", "selected"]
 * Aggregates download data and pulls the trigger
 */
const downloadFiles = ( type ) =>
{
  const syllabusButton = document.querySelectorAll( ".btn-primary" )[ 0 ]
  const syllabusLink =
    syllabusButton.innerText.trim() === "Download"
      ? syllabusButton.href
      : false

  let allLinks = Array.from( document.querySelectorAll( ".sexy-input" ) )
  allLinks = allLinks
    .filter( ( link ) => type === "all" || link[ "checked" ] )
    .map( ( link, index ) => getLinkInfo( siblings( link )[ 0 ], index ) )

  if ( syllabusLink && type === "all" )
  {
    allLinks.push( { title: "Syllabus", url: syllabusLink } )
  }
  const { course, facultySlotName } = getCourseInfo()

  return triggerDownloads( {
    linkData: allLinks,
    course: course,
    facultySlotName: facultySlotName,
  } )
}

/**
 * @function modifyCoursePage
 * Called when the course page is loaded, adds the checkboxes and buttons
 */
const modifyCoursePage = () =>
{
  // add selectAll checkbox
  const { course, facultySlotName } = getCourseInfo()
  const selectAllElem = document.createElement( "input" )
  selectAllElem.setAttribute( "type", "checkbox" )
  selectAllElem.setAttribute( "id", "selectAll" )
  document.querySelectorAll( ".table-responsive" )[ 0 ].appendChild( selectAllElem )
  const selectAllElemText = document.createElement( "label" )
  selectAllElemText.innerHTML = "<em>&nbsp;Select All</em>"
  document
    .querySelectorAll( ".table-responsive" )[ 0 ]
    .appendChild( selectAllElemText )
  selectAllElem.addEventListener( "click", selectAllLinks )

  // add checkboxes
  let arr_check = Array.from( document.querySelectorAll( ".btn-link" ) )
  let array_checkbox = []
  arr_check.forEach( ( checks ) =>
  {
    const check = Array.from( checks.querySelectorAll( "span" ) )
    check.forEach( ( checkElem ) =>
    {
      if ( !checkElem.innerHTML.includes( "Web Material" ) )
      {
        array_checkbox.push( checks )
      }
    } )
  } )

  array_checkbox.forEach( ( elem, index ) =>
  {
    elem.addEventListener(
      "click",
      ( event ) =>
      {
        event.preventDefault()
        return triggerDownloads( {
          linkData: [ getLinkInfo( elem, index ) ],
          course,
          facultySlotName,
        } )
      },
      false
    )

    const inputElem = document.createElement( "input" )
    inputElem.setAttribute( "type", "checkbox" )
    inputElem.setAttribute( "class", "sexy-input" )
    elem.parentNode.insertBefore( inputElem, elem.parentNode.firstChild )
  } )

  // projects page modification
  if ( document.querySelectorAll( ".btn-primary" ).length != 2 )
  {
    const btnLen = document.querySelectorAll( ".btn-primary" ).length
    const btnToRemove = document.querySelectorAll( ".btn-primary" )[ btnLen - 1 ]
    btnToRemove.parentNode.removeChild( btnToRemove )
  }

  // add new buttons
  const downloadAllFilesBtn = document.createElement( "input" )
  downloadAllFilesBtn.setAttribute( "type", "button" )
  downloadAllFilesBtn.setAttribute( "class", "btn btn-primary" )
  downloadAllFilesBtn.setAttribute(
    "style",
    "margin:4px;padding:3px 16px;font-size:13px;background-color:black;"
  )
  downloadAllFilesBtn.setAttribute( "value", "Download All Files" )
  downloadAllFilesBtn.setAttribute( "id", "downloadAll" )
  downloadAllFilesBtn.onclick = () => downloadFiles( "all" )

  const btnLen = document.querySelectorAll( ".btn-primary" ).length
  document
    .querySelectorAll( ".btn-primary" )
  [ btnLen - 1 ].insertAdjacentElement( "afterend", downloadAllFilesBtn )

  const downloadSelectedFilesBtn = document.createElement( "input" )
  downloadSelectedFilesBtn.setAttribute( "type", "button" )
  downloadSelectedFilesBtn.setAttribute( "class", "btn btn-primary" )
  downloadSelectedFilesBtn.setAttribute(
    "style",
    "margin:4px;padding:3px 16px;font-size:13px;background-color:black;"
  )
  downloadSelectedFilesBtn.setAttribute( "value", "Download Selected Files" )
  downloadSelectedFilesBtn.setAttribute( "id", "downloadSelected" )
  downloadSelectedFilesBtn.onclick = () => downloadFiles( "selected" )
  downloadAllFilesBtn.insertAdjacentElement(
    "afterend",
    downloadSelectedFilesBtn
  )

  // add credits
  const mainSection = document.getElementById( "main-section" )
  const creditsElem = document.createElement( "p" )
  creditsElem.innerHTML =
    '<center>CoursePage Download Manager - Made with ♥, <a href="https://www.github.com/Presto412" target="_blank">IEEE-CS</a></center>'
  mainSection.appendChild( creditsElem )
}

// Listener for messages from background
chrome.runtime.onMessage.addListener( ( request ) =>
{
  if ( request.message === "ReloadFacultyPage" )
  {
    try
    {
      chrome.storage.local.get( [ "facultyHTML" ], function ( result )
      {
        if ( !result )
        {
          throw new Error( "Invalid" )
        }
        document.querySelectorAll( "#main-section" ).innerHTML =
          result.facultyHTML
      } )
    } catch ( error )
    {
      console.log( error )
    }
  } else if ( request.message === "StoreFacultyPage" )
  {
    try
    {
      let html = document.querySelectorAll( "#main-section" )[ 0 ].outerHTML
      chrome.storage.local.set( { facultyHTML: html } )
    } catch ( error )
    {
      console.log( error )
    }
  } else if ( request.message === "CoursePageLoaded" )
  {
    try
    {
      const loader = setInterval( function ()
      {
        if ( document.readyState !== "complete" ) return
        clearInterval( loader )
        // gets the registration number
        regNo =
          document
            .querySelectorAll( ".VTopHeaderStyle" )[ 0 ]
            .innerText.replace( "(STUDENT)", "" )
            .trim() || ""
        modifyCoursePage()
      }, 100 )
    } catch ( error )
    {
      console.log( error )
    }
  }
} )
