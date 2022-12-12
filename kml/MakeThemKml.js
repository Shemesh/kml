'use strict';

const fs = require('fs'),
    path = require('path'),
    convert = require('xml-js'),
    formatter = require('xml-formatter'),
    archiver = require('archiver');

const folder = 'C:/Users/oshemesh/Downloads/12.12';
const file = 'Atsmautlhv'
const folderForKml = `${folder}/KMLs`;

const theSourceKml = path.join(folder, file + '.kml');

const prePolygons = '<?xml version="1.0" encoding="UTF-8"?><kml xmlnx="http://www.opengis.net/kml/2.2"><Document>' +
    '<name>' + file + ' walls polygons</name>' +
    '<Style id="wallsPolygons"><PolyStyle><color>ff51c27b</color></PolyStyle></Style>' +
    '<Placemark><name>walls polygons</name><styleUrl>#wallsPolygons</styleUrl><altitudeMode>absolute</altitudeMode><MultiGeometry>';

const preLines = '<?xml version="1.0" encoding="UTF-8"?><kml xmlnx="http://www.opengis.net/kml/2.2"><Document>' +
    '<name>' + file + ' walls lines</name>' +
    '<Style id="wallsLines"><PolyStyle><color>ff24b559</color></PolyStyle></Style>' +
    '<Placemark><name>walls lines</name><styleUrl>#wallsLines</styleUrl><altitudeMode>absolute</altitudeMode><MultiGeometry>';

const preSplays = '<?xml version="1.0" encoding="UTF-8"?><kml xmlnx="http://www.opengis.net/kml/2.2"><Document>' +
    '<name>' + file + ' splays</name><Style id="splays"><PolyStyle><color>ff66cccc</color></PolyStyle></Style>' +
    '<Placemark><name>splays</name><styleUrl>#splays</styleUrl><altitudeMode>absolute</altitudeMode><MultiGeometry>';

const preCenterline = '<?xml version="1.0" encoding="UTF-8"?><kml xmlnx="http://www.opengis.net/kml/2.2"><Document>' +
    '<name>' + file + ' centerline</name><Style id="centerline"><PolyStyle><color>ff0000ff</color></PolyStyle></Style>' +
    '<Placemark><name>centerline</name><styleUrl>#centerline</styleUrl><altitudeMode>absolute</altitudeMode><MultiGeometry>';

const preStations = '<?xml version="1.0" encoding="UTF-8"?><kml xmlnx="http://www.opengis.net/kml/2.2"><Document>' +
    '<name>' + file + ' stations</name><Style id="station"><LineStyle><color>ff0000ff</color></LineStyle></Style>'

const docKml = '<?xml version="1.0" encoding="UTF-8"?><kml xmlnx="http://www.opengis.net/kml/2.2"><Folder>' +
    '<name>' + file + '</name><open>1</open>' +
    '<NetworkLink><name>' + file + ' Centerline</name><Link><href>KMLs/' + file + '_Centerline.kml</href></Link></NetworkLink>' +
    '<NetworkLink><name>' + file + ' Splays</name><Link><href>KMLs/' + file + '_Splays.kml</href></Link></NetworkLink>' +
    '<NetworkLink><name>' + file + ' Stations</name><Link><href>KMLs/' + file + '_Stations.kml</href></Link></NetworkLink>' +
    '<NetworkLink><name>' + file + ' Walls Lines</name><Link><href>KMLs/' + file + '_WallsLines.kml</href></Link></NetworkLink>' +
    '<NetworkLink><name>' + file + ' Walls Polygons</name><Link><href>KMLs/' + file + '_WallsPolygons.kml</href></Link></NetworkLink>' +
    '</Folder></kml>'

const postDoc = '</Document></kml>';
const postMultiGeo = '</MultiGeometry></Placemark>' + postDoc;

let wallsPolygonsDataString = '';
let wallsLinesDataString = '';
let splaysLinesDataString = '';
let centerlineLinesDataString = '';
let stationsDataString = '';

// starting here
let kmlRead;
try {
    kmlRead = fs.readFileSync(theSourceKml);
} catch (err) {
    throw err;
}

const result = convert.xml2js(kmlRead, {compact: true, trim: true})
const wallsPolygonArr = result.kml.Document.Placemark.find(p => p.name._text === 'walls').MultiGeometry.Polygon;
const wallsLineStringArr = result.kml.Document.Placemark.find(p => p.name._text === 'walls').MultiGeometry.LineString
const splaysStringArr = result.kml.Document.Placemark.find(p => p.name._text === 'splays').MultiGeometry.LineString
const centerlineStringArr = result.kml.Document.Placemark.find(p => p.name._text === 'centerline').MultiGeometry.LineString
const stationsArr = result.kml.Document.Placemark.filter(p => p.styleUrl._text === '#station')

wallsPolygonArr.forEach(pp => {
    const coordinates = pp.outerBoundaryIs.LinearRing.coordinates._text;
    const arr = coordinates.split("\n").map(p => p.trim());
    arr.push(arr[0]); // fix missing closing fourth tuple, should be removed when cave3d fixed.
    if (isAllItemsEqual(arr)) {
        console.log(`wallsPolygonArr removed all equal: ${arr}`)
    } else {
        wallsPolygonsDataString += `<Polygon><outerBoundaryIs><LinearRing><coordinates>${arr.join("\n")}</coordinates></LinearRing></outerBoundaryIs></Polygon>`
    }
})

wallsLineStringArr.forEach(pp => {
    const coordinates = pp.coordinates._text;
    const arr = coordinates.split(" ");
    if (isAllItemsEqual(arr)) {
        console.log(`wallsLineStringArr removed all equal: ${coordinates}`)
    } else {
        wallsLinesDataString += `<LineString><coordinates>${coordinates}</coordinates></LineString>`
    }
})

splaysStringArr.forEach(pp => {
    const coordinates = pp.coordinates._text;
    const arr = coordinates.split(" ");
    if (isAllItemsEqual(arr)) {
        console.log(`splaysStringArr removed all equal: ${coordinates}`)
    } else {
        splaysLinesDataString += `<LineString><coordinates>${coordinates}</coordinates></LineString>`
    }
})

centerlineStringArr.forEach(pp => {
    const coordinates = pp.coordinates._text;
    const arr = coordinates.split(" ");
    if (isAllItemsEqual(arr)) {
        console.log(`centerlineStringArr removed all equal: ${coordinates}`)
    } else {
        const id = pp._attributes.id;
        centerlineLinesDataString += `<LineString id="${id}"><coordinates>${coordinates}</coordinates></LineString>`
    }
})

stationsArr.forEach(pp => {
    stationsDataString += `<Placemark>
<name>${pp.name._text}</name>
<styleUrl>#station</styleUrl>
<MultiGeometry>
<Point id="${pp.MultiGeometry.Point._attributes.id}">
<coordinates>${pp.MultiGeometry.Point.coordinates._text}</coordinates>
</Point>
</MultiGeometry></Placemark>`
});

writeToFile('WallsPolygons', prePolygons + wallsPolygonsDataString + postMultiGeo)
writeToFile('WallsLines', preLines + wallsLinesDataString + postMultiGeo)
writeToFile('Splays', preSplays + splaysLinesDataString + postMultiGeo)
writeToFile('Centerline', preCenterline + centerlineLinesDataString + postMultiGeo)
writeToFile('Stations', preStations + stationsDataString + postDoc)

createKmz();

function isAllItemsEqual(arr) {
    return arr.every((val, i, arr) => val === arr[0])
}

function writeToFile(fileName, kmlStr) {
    const formatted = formatter(kmlStr, {
        collapseContent: true,
        lineSeparator: '\n'
    });
    const fileToWrite = `${folderForKml}/${file}_${fileName}.kml`;
    if (!fs.existsSync(folderForKml)) {
        fs.mkdirSync(folderForKml, { recursive: true});
    }
    try {
        fs.writeFileSync(fileToWrite, formatted);
        console.log(`file:///${fileToWrite} DONE!`);
    } catch (err) {
        throw err;
    }

}

function createKmz() {
    const output = fs.createWriteStream(`${folder}/${file}.kmz`);
    const archive = archiver('zip', {zlib: {level: 9}});

    output.on('close', function () {
        console.log(`KMZ file:///${folder}/${file}.kmz DONE!`);
    });

    archive.on('warning', function (err) {
        throw err;
    });

    archive.on('error', function (err) {
        throw err;
    });

    archive.pipe(output);

    archive.append(formatter(docKml, {collapseContent: true, lineSeparator: '\n'}), {name: 'doc.kml'});

    archive.directory(folderForKml, 'KMLs');

    archive.finalize();
}
