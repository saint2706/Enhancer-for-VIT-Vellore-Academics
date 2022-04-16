/**
 * @module CaptchaParser
 */

/**
 * @function CaptchaParse
 * @param {ImageBitmap} imgarr
 * The main captcha parsing algorithm
 */
const CaptchaParse = ( imgarr ) =>
{
  let captcha = ""
  for ( let x = 1; x < 44; x++ )
  {
    for ( let y = 1; y < 179; y++ )
    {
      const condition1 =
        imgarr[ x ][ y - 1 ] === 255 &&
        imgarr[ x ][ y ] === 0 &&
        imgarr[ x ][ y + 1 ] === 255
      const condition2 =
        imgarr[ x - 1 ][ y ] === 255 &&
        imgarr[ x ][ y ] === 0 &&
        imgarr[ x + 1 ][ y ] === 255
      const condition3 = imgarr[ x ][ y ] !== 255 && imgarr[ x ][ y ] !== 0
      if ( condition1 || condition2 || condition3 )
      {
        imgarr[ x ][ y ] = 255
      }
    }
  }
  for ( let j = 30; j < 181; j += 30 )
  {
    let matches = []
    const chars = "123456789ABCDEFGHIJKLMNPQRSTUVWXYZ"
    for ( let i = 0; i < chars.length; i++ )
    {
      let match = 0
      let black = 0
      const ch = chars.charAt( i )
      const mask = bitmaps[ ch ]
      for ( let x = 0; x < 32; x++ )
      {
        for ( let y = 0; y < 30; y++ )
        {
          let y1 = y + j - 30
          let x1 = x + 12
          if ( imgarr[ x1 ][ y1 ] == mask[ x ][ y ] && mask[ x ][ y ] == 0 )
          {
            match += 1
          }
          if ( mask[ x ][ y ] == 0 )
          {
            black += 1
          }
        }
      }
      const perc = match / black
      matches.push( [ perc, ch ] )
    }
    captcha += matches.reduce(
      function ( a, b )
      {
        return a[ 0 ] > b[ 0 ] ? a : b
      },
      [ 0, 0 ]
    )[ 1 ]
  }
  return captcha
}

/**
 * @function convertURIToImageData
 * @param {String} URI
 * Converts a base64 encoded string to an image
 */
const convertURIToImageData = ( URI ) =>
{
  return new Promise( function ( resolve, reject )
  {
    if ( URI == null ) return reject()
    const canvas = document.createElement( "canvas" )
    const context = canvas.getContext( "2d" )
    let image = new Image()
    image.addEventListener(
      "load",
      function ()
      {
        canvas.width = image.width
        canvas.height = image.height
        context.drawImage( image, 0, 0, canvas.width, canvas.height )
        resolve( context.getImageData( 0, 0, canvas.width, canvas.height ) )
      },
      false
    )
    image.src = URI
  } )
}

/**
 * @function fillCaptcha
 * @param {String} imgb64
 * Fills the captcha text input
 */
const fillCaptcha = ( imgb64 ) =>
{
  const URI = imgb64
  convertURIToImageData( URI ).then( ( imageData ) =>
  {
    let arr = []
    let newArr = []
    for ( let i = 0; i < imageData[ "data" ].length; i += 4 )
    {
      let gval =
        imageData[ "data" ][ i ] * 0.299 +
        imageData[ "data" ][ i + 1 ] * 0.587 +
        imageData[ "data" ][ i + 2 ] * 0.114
      arr.push( gval )
    }
    while ( arr.length ) newArr.push( arr.splice( 0, 180 ) )
    const res = CaptchaParse( newArr )
    document.getElementById( "captchaCheck" ).value = res
  } )
}

/**
 * @function SolveCap
 * @param {DOMElement}
 * Does the middleman works and concludes
 */
const SolveCap = ( img ) =>
{
  const image = img.src
  fillCaptcha( image )
  const credsHolder = document.createElement( "center" )
  const creds = document.createTextNode( "AutoCaptcha - Made with ♥, IEEE-CS" )
  credsHolder.appendChild( creds )
  document
    .getElementsByClassName( "col-md-offset-1" )[ 0 ]
    .appendChild( credsHolder )
}

window.addEventListener( "load", myMain, false )

function myMain ( evt )
{
  const jsInitChecktimer = setInterval( checkForJS_Finish, 111 )

  function checkForJS_Finish ()
  {
    let element = document.querySelector( 'img[alt="vtopCaptcha"]' )
    if ( element )
    {
      clearInterval( jsInitChecktimer )
      SolveCap( element )
      let observer = new MutationObserver( function ()
      {
        SolveCap( document.querySelector( 'img[alt="vtopCaptcha"]' ) )
      } )
      observer.observe( document.getElementById( "captchaRefresh" ), {
        childList: true,
      } )
    }
  }
}
