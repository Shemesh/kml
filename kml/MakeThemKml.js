'use strict';

const fs = require('fs'),
    path = require('path'),
    xmlReader = require('read-xml'),
    convert = require('xml-js');

const folder = 'C:\\Users\\oshemesh\\Downloads\\Atsmautlhv\\';
const file = 'Atsmautlhv'

const theSourceKml = path.join(folder, file+'.kml');

const polygonsPre = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<kml xmlnx="http://www.opengis.net/kml/2.2">\n' +
    '    <Document>\n' +
    '        <name>'+file+' walls polygons</name>\n' +
    '        <Style id="wallsPolygons">\n' +
    '            <PolyStyle>\n' +
    '                <color>ff51c27b</color>\n' +
    '            </PolyStyle>\n' +
    '        </Style>\n' +
    '        <Placemark>\n' +
    '            <name>walls polygons</name>\n' +
    '            <styleUrl>#wallsPolygons</styleUrl>\n' +
    '            <altitudeMode>absolute</altitudeMode>\n' +
    '            <MultiGeometry>\n';

const linesPre = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<kml xmlnx="http://www.opengis.net/kml/2.2">\n' +
    '    <Document>\n' +
    '        <name>'+file+' walls lines</name>\n' +
    '        <Style id="wallsLines">\n' +
    '            <PolyStyle>\n' +
    '                <color>ff24b559</color>\n' +
    '            </PolyStyle>\n' +
    '        </Style>\n' +
    '        <Placemark>\n' +
    '            <name>walls lines</name>\n' +
    '            <styleUrl>#wallsLines</styleUrl>\n' +
    '            <altitudeMode>absolute</altitudeMode>\n' +
    '            <MultiGeometry>\n';

const splaysPre = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<kml xmlnx="http://www.opengis.net/kml/2.2">\n' +
    '    <Document>\n' +
    '        <name>'+file+' splays</name>\n' +
    '        <Style id="splays">\n' +
    '            <PolyStyle>\n' +
    '                <color>ff66cccc</color>\n' +
    '            </PolyStyle>\n' +
    '        </Style>\n' +
    '        <Placemark>\n' +
    '            <name>splays</name>\n' +
    '            <styleUrl>#splays</styleUrl>\n' +
    '            <altitudeMode>absolute</altitudeMode>\n' +
    '            <MultiGeometry>\n';

const centerlinePre = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<kml xmlnx="http://www.opengis.net/kml/2.2">\n' +
    '    <Document>\n' +
    '        <name>'+file+' centerline</name>\n' +
    '        <Style id="centerline">\n' +
    '            <PolyStyle>\n' +
    '                <color>ff0000ff</color>\n' +
    '            </PolyStyle>\n' +
    '        </Style>\n' +
    '        <Placemark>\n' +
    '            <name>centerline</name>\n' +
    '            <styleUrl>#centerline</styleUrl>\n' +
    '            <altitudeMode>absolute</altitudeMode>\n' +
    '            <MultiGeometry>\n';

const stationsPre = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<kml xmlnx="http://www.opengis.net/kml/2.2">\n' +
    '    <Document>\n' +
    '        <name>'+file+' stations</name>\n' +
    '        <Style id="station">\n' +
    '            <LineStyle>\n' +
    '                <color>ff0000ff</color>\n' +
    '            </LineStyle>\n' +
    '        </Style>\n'

const postDoc = '    </Document>\n' +
    '</kml>';

const postMultiGeo = '            </MultiGeometry>\n' +
    '        </Placemark>\n' + postDoc;

let wallsPolygonsDataString = '';
let wallsLinesDataString = '';
let splaysLinesDataString = '';
let centerlineLinesDataString = '';
let stationsDataString = '';

xmlReader.readXML(fs.readFileSync(theSourceKml), function(err, data) {
    if (err) {
        console.error(err);
    }

    const xml = data.content;
    const result = JSON.parse(convert.xml2json(xml, {compact: true, spaces: 4}));
    const wallsPolygonArr = result.kml.Document.Placemark.find(p => p.name._text === 'walls').MultiGeometry.Polygon;
    const wallsLineStringArr = result.kml.Document.Placemark.find(p => p.name._text === 'walls').MultiGeometry.LineString
    const splaysStringArr = result.kml.Document.Placemark.find(p => p.name._text === 'splays').MultiGeometry.LineString
    const centerlineStringArr = result.kml.Document.Placemark.find(p => p.name._text === 'centerline').MultiGeometry.LineString
    const stationsArr = result.kml.Document.Placemark.filter(p => p.styleUrl._text === '#station')

    wallsPolygonArr.forEach(pp => {
        const coordinates = pp.outerBoundaryIs.LinearRing.coordinates._text;
        const arr = coordinates.trim().split("\n").map(p => p.trim());
        if (isAllItemsEqual(arr)) {
            console.log(`wallsPolygonArr found all equal: ${coordinates}`)
        } else {
            wallsPolygonsDataString += `                <Polygon><outerBoundaryIs><LinearRing><coordinates>${coordinates}</coordinates></LinearRing></outerBoundaryIs></Polygon>\n`
        }
    })

    wallsLineStringArr.forEach(pp => {
        const coordinates = pp.coordinates._text.trim();
        const arr = coordinates.split(" ");
        if (isAllItemsEqual(arr)) {
            console.log(`wallsLineStringArr found all equal: ${coordinates}`)
        } else {
            wallsLinesDataString += `                <LineString><coordinates>${coordinates}</coordinates></LineString>\n`
        }
    })

    splaysStringArr.forEach(pp => {
        const coordinates = pp.coordinates._text.trim();
        const arr = coordinates.split(" ");
        if (isAllItemsEqual(arr)) {
            console.log(`splaysStringArr found all equal: ${coordinates}`)
        } else {
            splaysLinesDataString += `                <LineString><coordinates>${coordinates}</coordinates></LineString>\n`
        }
    })

    centerlineStringArr.forEach(pp => {
        const coordinates = pp.coordinates._text.trim();
        const arr = coordinates.split(" ");
        if (isAllItemsEqual(arr)) {
            console.log(`centerlineStringArr found all equal: ${coordinates}`)
        } else {
            const id = pp._attributes.id;
            centerlineLinesDataString += `                <LineString id="${id}"><coordinates>${coordinates}</coordinates></LineString>\n`
        }
    })

    stationsArr.forEach(pp => {
        stationsDataString += `        <Placemark>
            <name>${pp.name._text}</name>
            <styleUrl>#station</styleUrl>
            <MultiGeometry>
                <Point id="${pp.MultiGeometry.Point._attributes.id}">
                    <coordinates>${pp.MultiGeometry.Point.coordinates._text}</coordinates>
                </Point>
            </MultiGeometry>
        </Placemark>\n`
    })
});

function isAllItemsEqual(arr) {
    return arr.every( (val, i, arr) => val === arr[0] )
}

fs.writeFile(folder+file+'_WallsPolygons.kml', polygonsPre + wallsPolygonsDataString + postMultiGeo, function (err) {
    if (err) throw err;
    console.log('_WallsPolygons.kml Done!');
});

fs.writeFile(folder+file+'_WallsLines.kml', linesPre + wallsLinesDataString + postMultiGeo, function (err) {
    if (err) throw err;
    console.log('_WallsLines.kml Done!');
});

fs.writeFile(folder+file+'_Splays.kml', splaysPre + splaysLinesDataString + postMultiGeo, function (err) {
    if (err) throw err;
    console.log('_Splays.kml Done!');
});

fs.writeFile(folder+file+'_Centerline.kml', centerlinePre + centerlineLinesDataString + postMultiGeo, function (err) {
    if (err) throw err;
    console.log('_Centerline.kml Done!');
});

fs.writeFile(folder+file+'_Stations.kml', stationsPre + stationsDataString + postDoc, function (err) {
    if (err) throw err;
    console.log('_Stations.kml Done!');
});

