# BaidumapAreaEditor
A javascript AreaEditor implement using BaiduMap Api 

## deploy

Get your AK from your baidu account [get your ak here](http://lbsyun.baidu.com/apiconsole/key)

Put it in file editor.html


## preview

![image](https://github.com/slankka/BaidumapAreaEditor/blob/master/area_editor.jpg)

## eventListenerPath
This file is a monkey pach, avoiding offical js lib function addEventListener adding more than one duplicate event handler.
During now 2017-01-11 11:18:21, it may have not been fixed offically.

## Update
2017年3月16日 20:36:54. I found that my baiduMap tool didn't work fine. After a few minutes, I found Baidu May fixed the EventListener bug.
So, when I disable the EventListenerPath, my map tool worked normal now.