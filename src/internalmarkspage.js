/**
 * @function modifyInternalMarksPage
 * Called when the Internal Page is loaded, shows averages and totals
 */

const modifyInternalMarksPage = () =>
{
  let addClassAvg = document.querySelectorAll( ".tableHeader-level1" )
  addClassAvg.forEach( ( addClassAvgs ) =>
  {
    let newTableHeader = addClassAvgs.innerHTML.split( "\n" )
    newTableHeader.splice( 9, 0, "<td>Class Average Weightage</td>" )
    addClassAvgs.innerHTML = newTableHeader.join( "" )
  } )

  let addClassWeightage = document.querySelectorAll( ".tableContent-level1" )
  addClassWeightage.forEach( ( addClassWeightages ) =>
  {
    let newTableContent = addClassWeightages.innerHTML.split( "\n" )
    let maxMark = newTableContent[ 3 ].replace( /[^\d.]/g, "" )
    let weightage = newTableContent[ 4 ].replace( /[^\d.]/g, "" )
    let classAverage = newTableContent[ 8 ].replace( /[^\d.]/g, "" )
    let classAverageWeightage = ( classAverage * weightage ) / maxMark
    newTableContent.splice(
      9,
      0,
      "<td><output>" + classAverageWeightage.toFixed( 2 ) + "</output></td>"
    )
    addClassWeightages.innerHTML = newTableContent.join( "" )
    return
  } )

  let tables = document.querySelectorAll( ".customTable-level1 > tbody" )
  tables.forEach( ( table ) =>
  {
    let totalClassWeightage = 0,
      totalUserWeightage = 0,
      totalMaxMark = 0,
      totalWeightage = 0,
      totalScoredMark = 0,
      totalClassAverage = 0

    let tableData = table.querySelectorAll( ".tableContent-level1" )

    tableData = Array.from( tableData )

    tableData.map( function ( row )
    {
      let tableContent = row.innerHTML.split( "<td>" )

      let maxMark = tableContent[ 3 ].replace( /[^\d.]/g, "" )
      let weightage = tableContent[ 4 ].replace( /[^\d.]/g, "" )
      let scoredMark = tableContent[ 6 ].replace( /[^\d.]/g, "" )
      let userWeightage = tableContent[ 7 ].replace( /[^\d.]/g, "" )
      let classAverage = tableContent[ 8 ].replace( /[^\d.]/g, "" )
      let classWeightage = tableContent[ 9 ].replace( /[^\d.]/g, "" )

      totalMaxMark += parseFloat( maxMark )
      totalWeightage += parseFloat( weightage )
      totalScoredMark += parseFloat( scoredMark )
      totalClassAverage += parseFloat( classAverage )
      totalUserWeightage += parseFloat( userWeightage )
      totalClassWeightage += parseFloat( classWeightage )
    } )

    // Adds the row to display row
    table.innerHTML += `
        <tr class='tableContent-level1' style='background: #efd2a5;' >
            <td></td>
            <td><b>Total:</b></td>
            <td> ${ totalMaxMark.toFixed( 2 ) } </td>
            <td> ${ totalWeightage.toFixed( 2 ) } </td>
            <td></td>
            <td> ${ totalScoredMark.toFixed( 2 ) } </td>
            <td style='font-weight: 700' > ${ totalUserWeightage.toFixed(
      2
    ) } </td>
            <td> ${ totalClassAverage.toFixed( 2 ) } </td>
            <td style='font-weight: 700' > ${ totalClassWeightage.toFixed(
      2
    ) } </td>
            <td></td>
            <td></td>
        </tr>`
  } )
}

chrome.runtime.onMessage.addListener( ( request ) =>
{
  if ( request.message === "MarkViewPage" )
  {
    try
    {
      modifyInternalMarksPage()
    } catch ( error )
    {
      console.log( error )
    }
  }
} )
