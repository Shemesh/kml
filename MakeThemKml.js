'use strict';

const fs = require('fs'),
    path = require('path'),
    convert = require('xml-js'),
    formatter = require('xml-formatter'),
    prompt = require("prompt-sync")({ sigint: true }),
    archiver = require('archiver');

const theSourceKml = prompt("enter path to the source KML (example C:/Users/Downloads/cave.kml) : ");
const fixedStation = prompt("fixed station is : ");
console.log(`theSourceKml = ${theSourceKml}`);

const folder = path.dirname(theSourceKml);
const fileName = path.basename(theSourceKml, '.kml');
const folderForKml = `${folder}/KMLs`;

const prePolygons = '<?xml version="1.0" encoding="UTF-8"?><kml xmlnx="http://www.opengis.net/kml/2.2"><Document>' +
    '<name>' + fileName + ' walls polygons</name>' +
    '<Style id="wallsPolygons"><PolyStyle><color>ff51c27b</color><outline>0</outline></PolyStyle></Style>' +
    '<Placemark><name>walls polygons</name><styleUrl>#wallsPolygons</styleUrl><altitudeMode>absolute</altitudeMode><MultiGeometry>';

const preLines = '<?xml version="1.0" encoding="UTF-8"?><kml xmlnx="http://www.opengis.net/kml/2.2"><Document>' +
    '<name>' + fileName + ' walls lines</name>' +
    '<Style id="wallsLines"><LineStyle><color>ff45a864</color></LineStyle></Style>' +
    '<Placemark><name>walls lines</name><styleUrl>#wallsLines</styleUrl><altitudeMode>absolute</altitudeMode><MultiGeometry>';

const preSplays = '<?xml version="1.0" encoding="UTF-8"?><kml xmlnx="http://www.opengis.net/kml/2.2"><Document>' +
    '<name>' + fileName + ' splays</name><Style id="splays"><LineStyle><color>ffe1e1e1</color></LineStyle></Style>' +
    '<Placemark><name>splays</name><styleUrl>#splays</styleUrl><altitudeMode>absolute</altitudeMode><MultiGeometry>';

const preCenterline = '<?xml version="1.0" encoding="UTF-8"?><kml xmlnx="http://www.opengis.net/kml/2.2"><Document>' +
    '<name>' + fileName + ' centerline</name><Style id="centerline"><LineStyle><color>ff000000</color></LineStyle></Style>' +
    '<Placemark><name>centerline</name><styleUrl>#centerline</styleUrl><altitudeMode>absolute</altitudeMode><MultiGeometry>';

const preStations = '<?xml version="1.0" encoding="UTF-8"?><kml xmlnx="http://www.opengis.net/kml/2.2"><Document>' +
    '<name>' + fileName + ' stations</name><Style id="station"><LabelStyle><scale>0.7</scale></LabelStyle></Style>'

const preFixedStation = '<?xml version="1.0" encoding="UTF-8"?><kml xmlnx="http://www.opengis.net/kml/2.2"><Document>' +
    '<name>' + fileName + ' fixed station</name><Style id="station"><LabelStyle><scale>0.7</scale></LabelStyle></Style>'

const docKml = '<?xml version="1.0" encoding="UTF-8"?><kml xmlnx="http://www.opengis.net/kml/2.2"><Folder>' +
    '<name>' + fileName + '</name><open>1</open>' +
    '<NetworkLink><name>' + fileName + ' Centerline</name><Link><href>KMLs/' + fileName + '_Centerline.kml</href></Link></NetworkLink>' +
    '<NetworkLink><name>' + fileName + ' Splays</name><visibility>0</visibility><Link><href>KMLs/' + fileName + '_Splays.kml</href></Link></NetworkLink>' +
    '<NetworkLink><name>' + fileName + ' Stations</name><visibility>0</visibility><Link><href>KMLs/' + fileName + '_Stations.kml</href></Link></NetworkLink>' +
    '<NetworkLink><name>' + fileName + ' Walls Lines</name><Link><href>KMLs/' + fileName + '_WallsLines.kml</href></Link></NetworkLink>' +
    '<NetworkLink><name>' + fileName + ' Walls Polygons</name><Link><href>KMLs/' + fileName + '_WallsPolygons.kml</href></Link></NetworkLink>' +
    '<NetworkLink><name>' + fileName + ' Fixed Station</name><Link><href>KMLs/' + fileName + '_FixedStation.kml</href></Link></NetworkLink>' +
    '</Folder></kml>'

const postDoc = '</Document></kml>';
const postMultiGeo = '</MultiGeometry></Placemark>' + postDoc;

let wallsPolygonsDataString = '';
let wallsLinesDataString = '';
let splaysLinesDataString = '';
let centerlineLinesDataString = '';
let stationsDataString = '';
let fixedStationDataString = '';

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
    // arr.push(arr[0]); // fix missing closing fourth tuple, should be removed when cave3d fixed.
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
    const station = `<Placemark>
<name>${pp.name._text}</name>
<styleUrl>#station</styleUrl>
<Point id="${pp.MultiGeometry.Point._attributes.id}">
<coordinates>${pp.MultiGeometry.Point.coordinates._text}</coordinates>
</Point></Placemark>`
    stationsDataString += station;
    if (pp.name._text.startsWith(fixedStation)) {
        fixedStationDataString = station;
    }
});

writeToFile('WallsPolygons', prePolygons + wallsPolygonsDataString + postMultiGeo)
writeToFile('WallsLines', preLines + wallsLinesDataString + postMultiGeo)
writeToFile('Splays', preSplays + splaysLinesDataString + postMultiGeo)
writeToFile('Centerline', preCenterline + centerlineLinesDataString + postMultiGeo)
writeToFile('Stations', preStations + stationsDataString + postDoc)
writeToFile('FixedStation', preFixedStation + fixedStationDataString + postDoc)

createKmz();

function isAllItemsEqual(arr) {
    return arr.every((val, i, arr) => val === arr[0])
}

function writeToFile(partName, kmlStr) {
    const formatted = formatter(kmlStr, {
        collapseContent: true,
        lineSeparator: '\n'
    });
    const fileToWrite = `${folderForKml}/${fileName}_${partName}.kml`;
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
    const output = fs.createWriteStream(`${folder}/${fileName}.kmz`);
    const archive = archiver('zip', {zlib: {level: 9}});

    output.on('close', function () {
        console.log(`KMZ file:///${folder}/${fileName}.kmz DONE!`);
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
