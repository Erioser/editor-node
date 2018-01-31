var http = require('http')
var path = require('path')
var fs = require('fs');
var url = require('url');
var express = require('express')
var formidable = require('formidable'); 
var bodyParser = require('body-parser')
var app = express()
app.use(express.static('public')); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'./index.html'))
})

app.post('/submit',(req,res)=>{  
    fs.writeFile('./public/temp.html',req.body.content,()=>{
        res.send('ok')
    })
    
})

app.post('/upload',(req,res)=>{
        // 文件将要上传到哪个文件夹下面
        var uploadfoldername = 'uploadfiles';
        var uploadfolderpath = __dirname + '/public/' + uploadfoldername;
        // ---------------------- 跨域上传 ----------------------
		// 使用第三方的 formidable 插件初始化一个 form 对象
        var form = new formidable.IncomingForm();
        //暂存区域
        form.uploadDir = path.join(__dirname,"/temp");
		
		// 处理 request
		form.parse(req, function (err, fields, files) {
			if (err) {
				return console.log('formidable, form.parse err');
			}
			var file = files['wangEditor_uploadImg'];
			// formidable 会将上传的文件存储为一个临时文件，现在获取这个文件的目录
			var tempfilepath = path.join(__dirname,'/temp/'+path.basename(file.path));
			// 获取文件类型
			var type = file.type;
			// 获取文件名，并根据文件名获取扩展名
			var filename = file.name;
			var extname = path.extname(filename)
			// 将文件名重新赋值为一个随机数（避免文件重名）
			filename = Math.random().toString().slice(2) + extname;

			// 构建将要存储的文件的路径
			var filenewpath = uploadfolderpath + '/' + filename;
            // 将临时文件保存为正式的文件

            let readStream = fs.createReadStream(tempfilepath)
            let writeStream = fs.createWriteStream(filenewpath)
            
            readStream.on('data',(chunk)=>{
                writeStream.write(chunk)
            })
            readStream.on('end',(chunk)=>{
                res.json({
                    errno: 0,
                    imgurl:'/uploadfiles/'+filename
                })
                fs.unlinkSync(tempfilepath)
            })

		});
})


var server = http.createServer(app)
server.listen(3000,()=>{
    console.log('server is listning')
})