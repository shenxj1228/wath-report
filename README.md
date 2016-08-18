# wath-report

监控文件并报送

通过node的文件模块监控文件变化，并通过socket广播

# useage

## 安装模块
 ` npm install `

##修改cfg下的cfg.js

``````

/** cfg.js 内容
* 配置的文件需要UTF8编码格式
* 文件重命名或者删除之后服务会停止
* 监听文件(./demo.txt,./demo2.txt),可以填写绝对路径(C:/aaa.txt) 斜杠采用'/'
**/
var cfg={
	"port":3300,
	"files":[
	"./demo.txt",
	"./demo2.txt"
	]
}
module.exports=cfg;

``````

## 启动
 ` node index.js `

### 可以使用forever进行常驻

` npm install -g forever `

` forever start index.js `
