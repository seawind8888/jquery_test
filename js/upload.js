jQuery.cxd_upload = function (options){
    var defaults = {
        selectfiles:"selectfiles" , // 选择文件
        postfiles:"postfiles",      // 开始上传
        container:"container" ,
        ossfile:"ossfile",
        console:"console",          // 提示框ID
        pic_input_name:"",          // 删除呢后图片路径存储在 input 框为 name 为 pic_input_name
        multi_selection:true        // false 只能单选  true 多选
    };
    var opts = $.extend(defaults, options);
    var accessid = ''
    var accesskey = ''
    var host = ''
    var policyBase64 = ''
    var signature = ''
    var callbackbody = ''
    var filename = ''
    var key = ''
    var expire = 0
    var g_object_name = ''
    var g_object_name_type = "local_name"
    var now = timestamp = Date.parse(new Date()) / 1000;

    var CxdFun = {
        send_request:function(){
            var xmlhttp = null;
            if (window.XMLHttpRequest)
            {
                xmlhttp=new XMLHttpRequest();
            }
            else if (window.ActiveXObject)
            {
                xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
            }
            /*if (xmlhttp!=null)
            {
                serverUrl = 'http://192.168.1.192:8800/oss/get_token';
                xmlhttp.open( "GET", serverUrl, false );
                xmlhttp.send( null );
                return xmlhttp.responseText
            }*/
            else
            {
                alert("Your browser does not support XMLHTTP.");
            }
        },
        get_signature:function(){
            //可以判断当前expire是否超过了当前时间,如果超过了当前时间,就重新取一下.3s 做为缓冲
            now = timestamp = Date.parse(new Date()) / 1000;
            if (expire < now + 3)
            {
                body = CxdFun.send_request();
                //var obj = eval ("(" + body + ")");
                host = 'http://cxd-file.oss-cn-beijing.aliyuncs.com/';
                policyBase64 = 'eyJjb25kaXRpb25zIjogW1sic3RhcnRzLXdpdGgiLCAiJGtleSIsICJ1cGxvYWQvMjAxNjA4MTUvIl1dLCAiZXhwaXJhdGlvbiI6ICIyMDE2LTA4LTE1VDEwOjI2OjUzWiJ9';
                accessid = 'upPHmYsKza7ebDjI';
                signature = 'p8oqGkTB0UzJo4IkJMU1eUhLH5Y=';
                expire = parseInt('1471228013');
                callbackbody = 'eyJjYWxsYmFja0JvZHlUeXBlIjogImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCIsICJjYWxsYmFja0JvZHkiOiAiZmlsZW5hbWU9JHtvYmplY3R9JnNpemU9JHtzaXplfSZtaW1lVHlwZT0ke21pbWVUeXBlfSZoZWlnaHQ9JHtpbWFnZUluZm8uaGVpZ2h0fSZ3aWR0aD0ke2ltYWdlSW5mby53aWR0aH0iLCAiY2FsbGJhY2tVcmwiOiAiaHR0cDovL29zcy1kZW1vLmFsaXl1bmNzLmNvbToyMzQ1MCJ9';
                key = 'upload/20160815/';
                return true;
            }
            return false;
        },

        get_suffix:function (filename) {
            console.log(filename)
            pos = filename.lastIndexOf('.')
            suffix = ''
            if (pos != -1) {
                suffix = filename.substring(pos)
            }
            return suffix;
        },
        calculate_object_name:function(filename) {
            if (g_object_name_type == 'local_name')
            {
                g_object_name += "${filename}"
            }
            else if (g_object_name_type == 'random_name')
            {
                suffix = CxdFun.get_suffix(filename)
                g_object_name = key + random_string(10) + suffix
            }
            return ''
        },

        random_string:function (len) {
            len = len || 32;
            var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
            var maxPos = chars.length;
            var pwd = '';
            for (i = 0; i < len; i++) {
                pwd += chars.charAt(Math.floor(Math.random() * maxPos));
            }
            return pwd;
        },
        set_upload_param:function(up, filename, ret){
            console.log(up);
            console.log(filename);
            console.log(ret);
            if (ret == false)
            {

                ret = CxdFun.get_signature()
            }
            g_object_name = key;
            if (filename != '') { suffix = CxdFun.get_suffix(filename);
                CxdFun.calculate_object_name(filename);

            }
            new_multipart_params = {
                'key' : g_object_name,
                'policy': policyBase64,
                'OSSAccessKeyId': accessid,
                'success_action_status' : '200', //让服务端返回200,不然，默认会返回204
                'callback' : callbackbody,
                'signature': signature
            };

            up.setOption({
                'url': host,
                'multipart_params': new_multipart_params
            });

            up.start();
        },
        get_uploaded_object_name:function(filename){
                if (g_object_name_type == 'local_name')
                {
                    tmp_name = g_object_name
                    tmp_name = tmp_name.replace("${filename}", filename);
                    return tmp_name
                }
                else if(g_object_name_type == 'random_name')
                {
                    return g_object_name
                }
        }

    }

    var uploader = new plupload.Uploader({
        runtimes : 'html5,flash,silverlight,html4',
        browse_button : opts.selectfiles,
        container: document.getElementById(opts.container),
        flash_swf_url : 'lib/plupload-2.1.2/js/Moxie.swf',
        silverlight_xap_url : 'lib/plupload-2.1.2/js/Moxie.xap',
        url : 'http://cxd-file.oss-cn-beijing.aliyuncs.com ',
        multi_selection: opts.multi_selection,
        filters: {
            mime_types : [ //只允许上传图片和zip文件
            { title : "Image files", extensions : "jpg,gif,png,bmp" },
            { title : "Zip files", extensions : "zip,rar" }
            ],
            max_file_size : '10mb', //最大只能上传10mb的文件
            prevent_duplicates : true //不允许选取重复文件
        },

        init: {
            PostInit: function() {
                document.getElementById(opts.ossfile).innerHTML = '';
                document.getElementById(opts.postfiles).onclick = function() {
                CxdFun.set_upload_param(uploader, '', false);
                return false;
                };
            },

            FilesAdded: function(up, files) {
                /**
                $.each(up.files, function (i, file) {
                    if (up.files.length <= 1) {
                        return;
                    }

                    up.removeFile(file);
                });
                */
                /**
                plupload.each(files, function(file) {
                    document.getElementById(ossfile).innerHTML += '<div id="ossfile" class="col-sm-2">' +
                    '<img id = "img_' + file.id + '"width="150" height="150" src="" alt="150x150"><div width="150" id="' + file.id + '">'
                    +'<div class="progress" width="150"><div class="progress-bar" style="width: 0%" width="150"></div></div>'
                    +'</div></div>';
                });
                */
                plupload.each(files, function(file) {
                    /**
                    document.getElementById(ossfile).innerHTML += '<div id="ossfile" class="col-sm-2">' +
                    '<img id = "img_' + file.id + '"width="150" height="150" src="" alt="150x150"><div width="150" id="' + file.id + '">'
                    +'<div class="progress" width="150"><div class="progress-bar" style="width: 0%" width="150"></div></div>'
                    +'</div></div>';
                    */
                    console.log(file.name);
                   //  var reader = new FileReader();
                   //  reader.onload = function (evt) {
                   //      console.log(evt);
                   //      prevDiv.innerHTML = '<img width="50px" height="50px" src="' + evt.target.result + '" />';
                   //  };



                    //ocument.getElementById('show').setAttribute('src',host+key);

                    document.getElementById('ossfile').innerHTML += '<div id="' + file.id + '">' + file.name + ' (' + plupload.formatSize(file.size) + ')<b></b>'
                        +'<div class="progress"><div class="progress-bar" style="width: 0%"></div></div>'
                        +'</div>';
                });

            },

            BeforeUpload: function(up, file) {
                CxdFun.set_upload_param(up, file.name, true);
            },

            UploadProgress: function(up, file) {

                var d = document.getElementById(file.id);
                // d.getElementsByTagName('b')[0].innerHTML = '<span>' + file.percent + "%</span>";
                var prog = d.getElementsByTagName('div')[0];
                var progBar = prog.getElementsByTagName('div')[0]
                progBar.style.width= 2*file.percent+'px';
                progBar.setAttribute('aria-valuenow', file.percent);
            },

            FileUploaded: function(up, file, info) {
                if (info.status == 200)
                {
                    document.getElementById('show').setAttribute('src',host+key+file.name);

                    document.getElementById(file.id).getElementsByTagName('b')[0].innerHTML = 'upload to oss success, object name:' + CxdFun.get_uploaded_object_name(file.name) + ' 回调服务器返回的内容是:' + info.response;
                }
                else if (info.status == 203)
                {
                    document.getElementById(file.id).getElementsByTagName('b')[0].innerHTML = '上传到OSS成功，但是oss访问用户设置的上传回调服务器失败，失败原因是:' + info.response;
                }
                else
                {
                    document.getElementById(file.id).getElementsByTagName('b')[0].innerHTML = info.response;
                }
            },

            Error: function(up, err) {
                if (err.code == -600) {
                    document.getElementById(opts.console).appendChild(document.createTextNode("\n选择的文件太大了,可以根据应用情况，在upload.js 设置一下上传的最大大小"));
                }
                else if (err.code == -601) {
                    document.getElementById(opts.console).appendChild(document.createTextNode("\n选择的文件后缀不对,可以根据应用情况，在upload.js进行设置可允许的上传文件类型"));
                }
                else if (err.code == -602) {
                    document.getElementById(opts.console).appendChild(document.createTextNode("\n这个文件已经上传过一遍了"));
                }
                else
                {
                    document.getElementById(opts.console).appendChild(document.createTextNode("\nError xml:" + err.response));
                }
            }
        }
    });
    uploader.init();
}



