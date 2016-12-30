/**
 * Created on 2016/12/29.
 */
    // 百度地图API功能
// var map = new BMap.Map("allmap");
// map.enableScrollWheelZoom();   //启用滚轮放大缩小，默认禁用
// map.centerAndZoom("重庆", 12);
//单击获取点击的经纬度
var map = window.map;
//当前点，当前标记点
var drawingAreaPoints = [];
var pointMarkersCreated = [];
var polygonCreated = [];//数据结构，包含polygon和markers
var polygonSpot = 0;
var polygonLast = 0;


//添加点
function addMarker(longitude, lattitude) {
    var point = new BMap.Point(longitude, lattitude);
    drawingAreaPoints.push(point);
    var marker = new BMap.Marker(point);
    pointMarkersCreated.push(marker);
    map.addOverlay(marker);
}
//事件处理器
var eventHandler = function (e) {
    addMarker(e.point.lng, e.point.lat);
};


//检查在编辑模式
function checkEditing() {
    for(var index = 0; index < polygonCreated.length; index++){
        polygonInfo = polygonCreated[index];
        var editing = polygonInfo['editing'];
        if(editing){
            return true;
        }
    }
    return false;
}

//开启绘制，退出绘制
function selectable(selectable){
    if(selectable){
        if(checkEditing()){
            alert("还没编辑完成");
        }else{
            map.addEventListener("click", eventHandler);
        }
    }else{
        map.removeEventListener("click", eventHandler);
    }

}

//绘制区域
function onDrawPolygon(points) {
    var polygon = new BMap.Polygon(points, {strokeColor: "black", strokeWeight: 2, strokeOpacity: 0.5});
    polygonCreated.push({"polygon": polygon, "markers": pointMarkersCreated, "editing": false});
    map.addOverlay(polygon);
}

//不显示所有marker
function remove_point() {
    if(polygonCreated.length == 0){
        alert("没有区域,拒绝操作");
    }
    for (var index = 0; index < polygonCreated.length; index++) {
        var polygonInfo = polygonCreated[index];
        var markers = polygonInfo['markers'];
        for (var markindex in markers) {
            if(markers.hasOwnProperty(markindex)){
                map.removeOverlay(markers[markindex]);
            }
        }
    }
}

//上一个或者下一个区域
function getNextIndex(forward) {
    polygonLast = polygonSpot;
    if (polygonCreated.length == 0) {
        polygonSpot = 0;
        return polygonSpot;
    }
    var factor = forward ? 1 : -1;
    polygonSpot = (polygonSpot + factor + polygonCreated.length) % polygonCreated.length;
    return polygonSpot;
}

//恢复上一次涂色
function recoverLastPainted(polygonIndex) {
    repaintColor(polygonIndex, "#fff", 0.65);
}

function paintRed(polygonIndex){
    repaintColor(polygonIndex, "red", 0.3);
}

//上一个区域
function lastPolygonArea() {
    if(polygonCreated.length == 0){
        return;
    }
    paintRed(getNextIndex(false));
    recoverLastPainted(polygonLast);
}

//下一个区域
function nextPolygonArea() {
    if(polygonCreated.length == 0){
        return;
    }
    paintRed(getNextIndex(true));
    recoverLastPainted(polygonLast);
}

//退出浏览模式
function quitBrowse() {
    recoverLastPainted(polygonSpot);
    polygonSpot = polygonCreated.length;
}

//撤销本次取点
function deletePoint() {
    drawingAreaPoints = [];
    for (var point_index in pointMarkersCreated) {
        map.removeOverlay(pointMarkersCreated[point_index]);
    }
}

//撤销上次绘制的图形
function deleteLastArea(all) {
    if (polygonCreated.length == 0) {
        return;
    }
    if (!all) {
        var polygonInfo = polygonCreated[polygonCreated.length - 1];
        var polygon = polygonInfo['polygon'];
        var markers = polygonInfo['markers'];
        for (var markindex in markers) {
            if(markers.hasOwnProperty(markindex)){
                map.removeOverlay(markers[markindex]);
            }
        }
        map.removeOverlay(polygon);
        polygonCreated.splice(-1, 1);
    } else {
        for (var index = 0; index < polygonCreated.length; index++) {
            polygonInfo = polygonCreated[index];
            polygon = polygonInfo['polygon'];
            markers = polygonInfo['markers'];
            for (var markerindex in markers) {
                if(markers.hasOwnProperty(markerindex)) {
                    map.removeOverlay(markers[markerindex]);
                }
            }
            map.removeOverlay(polygon);
        }
    }
    polygonSpot--;
}

//描点绘制
function draw() {
    if (drawingAreaPoints.length >= 3) {
        onDrawPolygon(drawingAreaPoints);
        quitBrowse();
        drawingAreaPoints = [];
        pointMarkersCreated = [];
    } else {
        alert("本次描点少于三个");
    }
}

//编辑区域、不编辑区域
function moveble_point(enable) {
    if (polygonSpot < polygonCreated.length) {
        var polygonInfo = polygonCreated[polygonSpot];
        var polygon = polygonInfo['polygon'];
        if (enable) {
            map.removeEventListener("click", eventHandler);
            polygon.enableEditing();
        } else {
            polygon.disableEditing();
            if(!checkEditing()){
                map.addEventListener("click", eventHandler);
            }
        }
    } else {
        alert("不在浏览模式");
    }
}

//退出编辑模式
function move_finished() {
    for (var index = 0; index < polygonCreated.length; index++) {
        polygonInfo = polygonCreated[index];
        polygon = polygonInfo['polygon'];
        polygon.disableEditing();
    }
    map.addEventListener("click", eventHandler);
}

function repaintColor(polygonIndex, color, opacity){
    if (0 <= polygonLast && polygonIndex < polygonCreated.length) {
        var polygonInfo = polygonCreated[polygonIndex];
        var polygon = polygonInfo['polygon'];
        map.removeOverlay(polygon);
        polygon.setFillColor(color);
        polygon.setFillOpacity(opacity);
        map.addOverlay(polygon);
    }
}

function flashPolygonLight(){
    for(var i=0; i< polygonCreated.length;i++){
        repaintColor(i, "yellow", 0.75);
    }
}

function flashPolygonDark(){
    for(var i=0; i< polygonCreated.length;i++){
        repaintColor(i, "#fff", 0.65);
    }
}
var isLight = false;
function drawingFinished(){
    if(isLight){
        flashPolygonDark();
        isLight=false;
    }else{
        flashPolygonLight();
        isLight=true;
    }
}