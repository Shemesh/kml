/*
'use strict';

const fs = require('fs'),
    path = require('path'),
    xmlReader = require('read-xml');
const convert = require('xml-js');
// const xmlWriter = require('xml-writer');

const FILE = path.join('C:/Users/oshemesh/Downloads/5.12', 'Berniki_5a12.kml');

const prePoly = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<kml xmlnx="http://www.opengis.net/kml/2.2">\n' +
    '    <Document>\n' +
    '        <name>walls poly</name>\n' +
    '        <Style id="walls_poly">\n' +
    '            <PolyStyle>\n' +
    '                <color>ff51c27b</color>\n' +
    '            </PolyStyle>\n' +
    '        </Style>\n' +
    '        <Placemark>\n' +
    '            <name>walls poly</name>\n' +
    '            <styleUrl>#walls_poly</styleUrl>\n' +
    '            <altitudeMode>absolute</altitudeMode>\n' +
    '            <MultiGeometry>\n';

const preLines = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<kml xmlnx="http://www.opengis.net/kml/2.2">\n' +
    '    <Document>\n' +
    '        <name>walls lines</name>\n' +
    '        <Style id="walls_lines">\n' +
    '            <PolyStyle>\n' +
    '                <color>ff24b559</color>\n' +
    '            </PolyStyle>\n' +
    '        </Style>\n' +
    '        <Placemark>\n' +
    '            <name>walls lines</name>\n' +
    '            <styleUrl>#walls_lines</styleUrl>\n' +
    '            <altitudeMode>absolute</altitudeMode>\n' +
    '            <MultiGeometry>\n';

const post = '\n</MultiGeometry>\n' +
    '        </Placemark>\n' +
    '    </Document>\n' +
    '</kml>'

// let xw = new xmlWriter;
let strPoly = '';
let strLines = '';

xmlReader.readXML(fs.readFileSync(FILE), function(err, data) {
    if (err) {
        console.error(err);
    }

    const xml = data.content;
    const result = JSON.parse(convert.xml2json(xml, {compact: true, spaces: 4}));
    const Polygon = result.kml.Document.Placemark.find(p => p.name._text === 'walls').MultiGeometry.Polygon;
    const LineString = result.kml.Document.Placemark.find(p => p.name._text === 'walls').MultiGeometry.LineString

    Polygon.forEach(pp => {
        // xw.startElement('Polygon');
        //     xw.startElement('outerBoundaryIs');
        //         xw.startElement('LinearRing');
        //             xw.startElement('coordinates');
        //                 xw.text(pp.outerBoundaryIs.LinearRing.coordinates._text);
        //             xw.endElement();
        //         xw.endElement();
        //     xw.endElement();
        // xw.endElement();
        const coor = pp.outerBoundaryIs.LinearRing.coordinates._text;
        strPoly += `<Polygon><outerBoundaryIs><LinearRing><coordinates>${coor}</coordinates></LinearRing></outerBoundaryIs></Polygon>\n`
    })

    LineString.forEach(pp => {
        const coor = pp.coordinates._text;
        strLines += `<LineString><coordinates>${coor}</coordinates></LineString>\n`
    })


    // console.log(xw.toString());

    // for(let i = 0; i < result.kml.Document.Placemark.MultiGeometry.Polygon.length; i++){
    //     const results = result.kml.Document.Placemark.MultiGeometry.Polygon[i];
    //     console.log(`results: ${results}`);
    //     // As I said before you have to split the returned value.
    //     // const coordinates = results.split(" ");
    //     // const longitude = coordinates[0];
    //     // const latitude = coordinates[1];
    //     // console.log("lat/long: " + latitude + ", " + longitude);
    // }
});

fs.writeFile('WallsPolly.kml', prePoly + strPoly + post, function (err) {
    if (err) throw err;
    console.log('Done!');
});

fs.writeFile('WallsLines.kml', preLines + strLines + post, function (err) {
    if (err) throw err;
    console.log('Done!');
});

// xmlReader.readXML(fs.readFileSync(FILE), function(err, data) {
//     if (err) {
//         console.error(err);
//     }
//
//     console.log('xml encoding:', data.encoding);
//     console.log('Decoded xml:', data.content);
// });
*/
