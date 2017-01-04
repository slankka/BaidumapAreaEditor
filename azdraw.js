/**
 * Created on 2016/12/29.
 */
//单击获取点击的经纬度
//当前点，当前标记点
var drawingAreaPoints = [];
var pointMarkersCreated = [];
var polygonCreated = [];//数据结构，包含polygon和markers
var polygonSpot = 0;
var polygonLast = 0;
//NAMESPACE
var Azdrawer = {};
Azdrawer.map = window.map;

//添加点
function addMarker(longitude, lattitude) {
    var point = new BMap.Point(longitude, lattitude);
    drawingAreaPoints.push(point);
    var marker = new BMap.Marker(point);
    pointMarkersCreated.push(marker);
    Azdrawer.map.addOverlay(marker);
}
//事件处理器
function clickEventHandler(e) {
    addMarker(e.point.lng, e.point.lat);
}

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
    var isloaded = window.loaded;
    if(selectable){
        if(!isloaded){
            alert("地图还没加载");
            return;
        }
        if(checkEditing()){
            alert("还没编辑完成");
        }else{
            addClkEvent();
        }
    }else{
        removeClkEvent();
    }
}

//绘制区域
function onDrawPolygon(points) {
    var polygon = new BMap.Polygon(points, {strokeColor: "black", strokeWeight: 2, strokeOpacity: 0.5});
    polygonCreated.push({"polygon": polygon, "markers": pointMarkersCreated, "editing": false});
    Azdrawer.map.addOverlay(polygon);
}

function deletePointMarker(polygonInfo){
    var markers = polygonInfo['markers'];
    for (var markindex in markers) {
        if(markers.hasOwnProperty(markindex)){
            Azdrawer.map.removeOverlay(markers[markindex]);
        }
    }
}

//不显示所有marker
function remove_point() {
    if(polygonCreated.length == 0){
        alert("没有区域,拒绝操作");
    }
    for (var index = 0; index < polygonCreated.length; index++) {
        deletePointMarker(polygonCreated[index]);
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
    if(polygonSpot != polygonLast){
        recoverLastPainted(polygonLast);
    }
}

//下一个区域
function nextPolygonArea() {
    if(polygonCreated.length == 0){
        return;
    }
    paintRed(getNextIndex(true));
    if(polygonSpot != polygonLast){
        recoverLastPainted(polygonLast);
    }
}

//退出浏览模式
function quitBrowse() {
    move_finished();
    recoverLastPainted(polygonSpot);
    polygonSpot = polygonCreated.length;
}

//撤销本次取点
function deletePoint() {
    drawingAreaPoints = [];
    for (var point_index in pointMarkersCreated) {
        Azdrawer.map.removeOverlay(pointMarkersCreated[point_index]);
    }
}

//撤销上次绘制的图形
function deleteLastArea(all) {
    if (polygonCreated.length == 0) {
        return;
    }
    if (!all) {
        var polygonInfo = polygonCreated[polygonCreated.length - 1];
        deletePointMarker(polygonInfo);
        Azdrawer.map.removeOverlay(polygonInfo['polygon']);
        polygonCreated.splice(-1, 1);
    } else {
        for (var index = 0; index < polygonCreated.length; index++) {
            polygonInfo = polygonCreated[index];
            deletePointMarker(polygonInfo);
            Azdrawer.map.removeOverlay(polygonInfo['polygon']);
        }
    }
    freshCount();
}

//描点绘制
function draw() {
    if (drawingAreaPoints.length >= 3) {
        onDrawPolygon(drawingAreaPoints);
        quitBrowse();//会导致多次注册
        drawingAreaPoints = [];
        pointMarkersCreated = [];
        freshCount();
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
            removeClkEvent();
            polygon.enableEditing();
        } else {
            polygon.disableEditing();
            if(!checkEditing()){
                addClkEvent();
            }
        }
    } else {
        alert("不在浏览模式");
    }
}

function addClkEvent(){
    Azdrawer.map.addEventListener("click", clickEventHandler);
    //console.log("EventHandler:", clickEventHandler.al['onclick']);
    //console.log("BaiduMap mapOnclickListener", map.Hi['onclick']);
}

function removeClkEvent(){
    Azdrawer.map.removeEventListener("click", clickEventHandler);
    //console.log("EventHandler:", clickEventHandler.al['onclick']);
    //console.log("BaiduMap mapOnclickListener", map.Hi['onclick']);
}

//退出编辑模式
function move_finished() {
    for (var index = 0; index < polygonCreated.length; index++) {
        var polygonInfo = polygonCreated[index];
        var polygon = polygonInfo['polygon'];
        polygon.disableEditing();
    }
}

//区域涂色
function repaintColor(polygonIndex, color, opacity){
    if (0 <= polygonIndex && polygonIndex < polygonCreated.length) {
        var polygonInfo = polygonCreated[polygonIndex];
        var polygon = polygonInfo['polygon'];
        Azdrawer.map.removeOverlay(polygon);
        polygon.setFillColor(color);
        polygon.setFillOpacity(opacity);
        Azdrawer.map.addOverlay(polygon);
    }
}
//亮起已绘制区域
function flashPolygonLight(){
    for(var i=0; i< polygonCreated.length;i++){
        repaintColor(i, "yellow", 0.75);
    }
}
//恢复已经绘制的区域
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

//打印输出区域
function printArea(){
    for (var index = 0; index < polygonCreated.length; index++) {
        var polygonInfo = polygonCreated[index];
        var polygon = polygonInfo['polygon'];
        var path = polygon.getPath();
        console.log("=====AREA_BEGIN====");
        for(var i=0;i< path.length;i++){
            console.log(path[i].lng + "," + path[i].lat);
        }
        console.log("======AREA_END=====");
    }
}

//计数器
function freshCount(){
    $("#currentNum").html(polygonCreated.length);
}

function about(){
    alert("地图编辑器，本编辑器使用了百度地图的API\n\nAuthor:https://github.com/slankka\n2016年12月29日 17:33:16");
}