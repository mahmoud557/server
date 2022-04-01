class Manager_Get_Stocks{
	constructor(props) {
		this.auth=process.env.get_stocks_auth;
		this.media_path='./media/';
		this.start()
	}

	async start(){
		this.handel_requstes()
		//this.load_componants()
	}	

	handel_requstes(){
		global.http_server.post('/manager_get_stocks/get_url_info',async(req,res)=>{
			var url_info=await this.get_url_info(req.body.url);
			res.json(url_info)
		})

		global.http_server.post('/manager_get_stocks/get_download_link',async(req,res)=>{
			await this.delay(3000)
			try{
				var file_key=`${req.body.download_object.url_info.url}__${req.body.download_object.price_line.key}`

				var cookie_validate_state=this.check_requset_cookie_validat(req);
				if(!cookie_validate_state['state']){return res.set('sucsess','false').end()}

				var log_in_state=await this.check_user_log_in_state(req.cookies['outh_token'])
				if(!log_in_state){return res.set('sucsess','false').end()}	
				
				var cheek_download_link_requste_validate_state=await this.cheek_download_link_requste_validate(req)
				if(!cheek_download_link_requste_validate_state){return res.set('sucsess','false').end()}		
				
				var cheek_if_user_have_file_key_on_download_list_state=await this.cheek_if_file_key_in_user_download_list(req,file_key)
				if(cheek_if_user_have_file_key_on_download_list_state.err){return res.set('sucsess','false').set('fail_resone','Server Errorr').end()}
				
				if(cheek_if_user_have_file_key_on_download_list_state.result){
					var file_cache_object_qurye=await manager_db.get_file_cache_object_from_files_cache(file_key)
					if(file_cache_object_qurye.err){return res.set('sucsess','false').end()}
					
					if(file_cache_object_qurye.result){
						var send_file_bytes_to_user_state=await this.send_file_bytes_to_user(res,`${file_cache_object_qurye.result['path']}`,`${file_cache_object_qurye.result['name']}`)
						if(!send_file_bytes_to_user_state){return res.set('sucsess','false').end()}
						return;
					}					
				}

				var cheek_if_user_have_palance_to_pay_state=await this.cheek_if_user_have_palance_to_pay(req)
				if(!cheek_if_user_have_palance_to_pay_state){return res.set('sucsess','false').set('fail_resone','no_palance').end()}	

				
				var file_cache_object_qurye=await manager_db.get_file_cache_object_from_files_cache(file_key)
				if(file_cache_object_qurye.err){return res.set('sucsess','false').end()}
				
				if(file_cache_object_qurye.result){
					var cut_coste_from_user_palance_state=await this.cut_coste_from_user_palance(req)
					if(!cut_coste_from_user_palance_state){return res.set('sucsess','false').set('fail_resone','Server Errorr').end()}

					var reqorde_file_in_user_download_list_state=await this.reqorde_file_in_user_download_list(req,file_key)
					if(!reqorde_file_in_user_download_list_state){return res.set('sucsess','false').set('fail_resone','Server Errorr').end()}					
					
					var send_file_bytes_to_user_state=await this.send_file_bytes_to_user(res,`${file_cache_object_qurye.result['path']}`,`${file_cache_object_qurye.result['name']}`)
					if(!send_file_bytes_to_user_state){return res.set('sucsess','false').end()}
					return;
				}

				var download_link_object=await this.get_download_link_object(req.body.download_object);
				if(!download_link_object){return res.set('sucsess','false').end()}
				
				var download_media_state=await this.download_media_by_download_link_object(download_link_object,`./media/`)
				if(!download_media_state){return res.set('sucsess','false').end()}
				
				var cache_object={key:file_key,path:`${this.media_path}${download_link_object.result.itemFilename}`,name:`${download_link_object.result.itemFilename}`}
				var save_on_cache_qurye=await manager_db.add_file_to_files_cache(cache_object);
				if(save_on_cache_qurye.err){return res.set('sucsess','false').end()}
				if(save_on_cache_qurye.result==null){res.set('sucsess','false').end()}

				var cut_coste_from_user_palance_state=await this.cut_coste_from_user_palance(req)
				if(!cut_coste_from_user_palance_state){return res.set('sucsess','false').set('fail_resone','Server Errorr').end()}

				var reqorde_file_in_user_download_list_state=await this.reqorde_file_in_user_download_list(req,file_key)
				if(!reqorde_file_in_user_download_list_state){return res.set('sucsess','false').set('fail_resone','Server Errorr').end()}	

				var send_file_bytes_to_user_state=await this.send_file_bytes_to_user(res,`${this.media_path}${download_link_object.result.itemFilename}`,`${download_link_object.result.itemFilename}`)
				if(!send_file_bytes_to_user_state){return res.set('sucsess','false').end()}
				
			}catch(err){
				console.log(err)
				return res.set('sucsess','false').end()
			}
		})					
	}	

	cheek_download_link_requste_validate(req){
		try{
			if(!req.body){return false}
			if(!req.body.download_object){return false}	
			if(!req.body.download_object.price_line){return false}	
			if(!req.body.download_object.price_line.key){return false}	
			if(!req.body.download_object.url_info.url){return false}	
			return true
		}catch(err){
			return false
		}
	}

	check_requset_cookie_validat(req){
		if(!req.cookies){return {state:false}}
		if(!req.cookies['outh_token']){return {state:false}}
		return {state:true}
	}

	check_user_log_in_state(outh_token){
		try{
			var decode=jwt.verify(outh_token, 'shhhhh');
			return decode['log_in_state']
		}catch(err){
			return false
		}	
	}

	async cheek_if_user_have_palance_to_pay(req){
		try{
			var cost=Number(req.body.download_object.price_line.value); //#shoud cheek
			var email=this.get_user_email_from_req(req)
			if(!email){return false}
			var user_palance_qurye=await manager_db.get_user_palance_by_email(email)
			if(user_palance_qurye.err){return false}
			var palance=user_palance_qurye.result;
			if(palance>=cost){return true}
			return false;
		}catch(err){
			return false
		}
	}

	async cut_coste_from_user_palance(req){
		try{
			var cost=Number(req.body.download_object.price_line.value); //#shoud cheek
			var email=this.get_user_email_from_req(req)
			if(!email){return false}
			var user_palance_qurye=await manager_db.get_user_palance_by_email(email)
			if(user_palance_qurye.err){return false}
			var palance=user_palance_qurye.result;
			var new_palance=palance-cost;
			var user_palance_update_qurye=await manager_db.update_user_palance_by_email(email,new_palance)
			if(user_palance_update_qurye.err){return false}
			return true;
		}catch(err){
			return false
		}
	}

	async reqorde_file_in_user_download_list(req,file_key){
		try{
			var download_list_row_object={
				file_key:file_key,
				price:req.body.download_object.price_line.value,
				provider:req.body.download_object['url_info']['result']['provSlug'],
				thump:req.body.download_object['url_info']['result']['itemThumb'],
				name:req.body.download_object['url_info']['result']['itemSlug']||req.body.download_object['url_info']['result']['itemName'],
			}

			var email=this.get_user_email_from_req(req)
			if(!email){return false}

			var download_list_qurye=await manager_db.get_user_download_list_by_email(email)
			if(download_list_qurye.err){return false}

			var download_list=download_list_qurye.result;
			download_list.push(download_list_row_object)

			var download_list_update_qurye=await manager_db.update_user_download_list_by_email(email,download_list)
			if(download_list_update_qurye.err){return false}

			return true;
		}catch(err){
			return false
		}
	}

	async cheek_if_file_key_in_user_download_list(req,file_key){
		try{
			var email=this.get_user_email_from_req(req)
			if(!email){return {err:false,result:false}}
			var download_list_qurye=await manager_db.get_user_download_list_by_email(email)
			if(download_list_qurye.err){return {err:true,result:false}}
			if(download_list_qurye.result.length==0){return {err:false,result:false}}
			var download_list_row=download_list_qurye.result.filter(row => row.file_key== file_key)
			if(download_list_row.length==0){return {err:false,result:false}}
			return {err:false,result:true}
		}catch(err){
			return {err:true,result:false}
		}
	}	

	get_user_email_from_req(req){
		try{
			var decode=jwt.verify(req.cookies['outh_token'], 'shhhhh');
			return decode['email']
		}catch(err){
			return false
		}	
	}	

	async get_download_link_object(download_object){
		try{
			var type=this.get_type_by_download_object(download_object)
			if(!type){return false}
	 		var response = await fetch(
	 			`https://getstocks.net/api/v1/getlink?token=${this.auth}&link=${download_object.url_info.url}&ispre=1&type=${type}`,
	 			{method: 'POST'}
			);
			const data = await response.json()
			console.log(data)
			var ask_for_download_link_object={
				slug:data.result.provSlug,
				id:data.result.itemID,
				ispre:'1',
				type:data.result.itemType
			}
			var download_link_ask_object=await this.ask_for_download_link(ask_for_download_link_object)
			if(download_link_ask_object.err){return false}
			return download_link_ask_object.result
		}catch(err){
			console.log(err)
			return false
		}
	}

	get_type_by_download_object(download_object){
		try{
			if((Object.keys(download_object.url_info.result.support.type)).length==1){
				var type_key=(Object.keys(download_object.url_info.result.support.type))[0]
				return type_key;
			}else{
				var price_line_key=download_object.price_line['key'];
				var types_keys=Object.keys(download_object.url_info.result.support.type);
				for(var type_key of types_keys){
					if(download_object.url_info.result.support.type[type_key].includes(price_line_key)){
						return type_key
					}
				}
				return false

			}			
		}catch(err){return false}

	}

	async ask_for_download_link(ask_for_download_link_object){
		try{
	 		var response = await fetch(
	 			`https://getstocks.net/api/v1/download-status?token=${this.auth}&slug=${ask_for_download_link_object.slug}&id=${ask_for_download_link_object.id}&type=${ask_for_download_link_object.type}&ispre=${ask_for_download_link_object.ispre}`,
	 			{method: 'POST'}
			);
			const data = await response.json()
			if(data.status==400){return {result:null,err:true}}
			if(data.status==200&&data.result.process=='Ready to Download'){
				var download_link=`https://getstocks.net/api/v1/download/${data.result.itemDCode}?token=${this.auth}`;
				data.download_link=download_link;
				return {result:data,err:false}
			}
			await this.delay(3000)
			return await this.ask_for_download_link(ask_for_download_link_object)			
		}catch(err){return false}
	}

	async download_media_by_download_link_object(download_link_object){
		try{
			var download_link=download_link_object.download_link;
			var file_path=`${this.media_path}${download_link_object.result.itemFilename}`;
			var resbond = await fetch(download_link);
			var fileStream = await fs.createWriteStream(file_path);
			var download_state=await new Promise((resolve, reject) => {
			    resbond.body.on("error", ()=>{
			    	console.log('err')
			    	resolve(false)
			    });
			    resbond.body.on("finish", ()=>{
			    	console.log('finish')
			    	resolve(true)
			    });
				fileStream.on('open', function () {
				    resbond.body.pipe(fileStream);
				});			      
			 });
			 if(!download_state){return false}
			 return download_state	
		}catch(err){return false}
	}

	async send_file_bytes_to_user(res,file_path,filename){
		try{
			var stats = fs.statSync(file_path);
    		var file_size = stats.size;
			var fileStream = await fs.createReadStream(file_path);
			var send_file_bytes_to_user_state=await new Promise((resolve, reject) => {
				res.set('sucsess','true')
				res.set({'file_name':`${filename}`})
				res.set({'file_size':`${file_size}`})
				fileStream.pipe(res);
			    fileStream.on("error", ()=>{
			    	console.log('err in send bytis')
			    	resolve(false)
			    });
			    res.on("finish",()=>{
			    	res.end()
			    	console.log('finish send bytis')
			    	resolve(true)
			    });	    
			});
			return send_file_bytes_to_user_state
		}catch(err){
			console.log(err)
			return false
		}
	}

	async get_url_info(url){
		try{
	 		var response = await fetch(
	 			`https://getstocks.net/api/v1/getinfo?token=${this.auth}&link=${url}&ispre=1`,
	 			{method: 'POST'}
			);
			const data = await response.json()
			if(data.status!=200){throw new Error('errorr')}
			if(!data.result.provSlug){throw new Error('cant ditict site')}
			var price_lines=this.get_price_lines(data)
			data.price_lines=price_lines;
			return data			
		}catch(err){
			return {error:true}
		}
	}

	get_price_lines(respond_object){
		switch(respond_object.result.provSlug){
			case "shutterstock":
				if(!respond_object.result.itemType){return new Error('cant ditict mdia')}
				if(respond_object.result.itemType=="photo"){return [{key:'Price',value:this.get_price_by_price_id(1)}]}
				if(respond_object.result.itemType=="illustration"){return [{key:'Price',value:this.get_price_by_price_id(1)}]}
				if(respond_object.result.itemType=="vector"){return [{key:'Price',value:this.get_price_by_price_id(1)}]}
				if(respond_object.result.itemType=="audio"){return [{key:'Price',value:this.get_price_by_price_id(204)}]}
				if(respond_object.result.itemType=="video"){ //not work
					if(!respond_object.result.is_footage_select){return [{key:'HD',value:this.get_price_by_price_id(100)},{key:'4K',value:this.get_price_by_price_id(120)}]}
					if(respond_object.result.is_footage_select){return [{key:'HD',value:this.get_price_by_price_id(110)},{key:'4K',value:this.get_price_by_price_id(22)}]}
				}
				break;
			case "adobestock":
				if(respond_object.result.is_image){return [{key:'Price',value:this.get_price_by_price_id(60)}]}
				if(respond_object.result.is_audio){return [{key:'Price',value:this.get_price_by_price_id(205)}]}
				if(respond_object.result.is_video){return "video"} //link not work
				return new Error('cant ditict mdia')			
				break;
			case "istockphoto":
				if(respond_object.result.itemExt=="jpg"){return [{key:'Price',value:this.get_price_by_price_id(7)}]}// link not work
				if(respond_object.result.itemExt=="eps"){return [{key:'Price',value:this.get_price_by_price_id(7)}]} // link not work
				if(respond_object.result.itemExt=="mov"){return [{key:'HD',value:this.get_price_by_price_id(25)},{key:'4K',value:this.get_price_by_price_id(255)}]} // link not work
				//if(respond_object.result.itemExt=="zip"){return "audio"}
				return new Error('cant ditict mdia')			
				break;			
			case "depositphotos":
				if(respond_object.result.itemExt=="jpg"){return [{key:'Price',value:this.get_price_by_price_id(5)}]}
				if(respond_object.result.itemExt=="eps"){return [{key:'Price',value:this.get_price_by_price_id(5)}]}
				if(respond_object.result.itemExt=="mov"){return [{key:'Price',value:this.get_price_by_price_id(27)}]}
				//if(respond_object.result.itemExt=="zip"){return "audio"} // link not work
				return new Error('cant ditict mdia')			
				break;
			case "storyblocks":
				return [{key:'Price',value:this.get_price_by_price_id(10)}]
				break;	
			case 'elementenvato':
				return [{key:'Price',value:this.get_price_by_price_id(6)}]
				break;								
			case "freepik":
				return [{key:'Price',value:this.get_price_by_price_id(2)}]
				break;
			case "123rf":
				return [{key:'Price',value:this.get_price_by_price_id(3)}]
				break;
			case "alamy":
				return [{key:'Price',value:this.get_price_by_price_id(4)}]
				break;
			case "dreamstime":
				return [{key:'Price',value:this.get_price_by_price_id(8)}]
				break;
			case "pngtree":
				return [{key:'Price',value:this.get_price_by_price_id(9)}]
				break;
			case "vecteezy":
				return [{key:'Price',value:this.get_price_by_price_id(1313)}]
				break;
			case "vectorgrove":
				return [{key:'Price',value:this.get_price_by_price_id(11)}]
				break;
			case "vectorstock":
				return [{key:'Price',value:this.get_price_by_price_id(12)}]
				break;
			case "vexels":
				return [{key:'Price',value:this.get_price_by_price_id(70)}]
				break;
			case "lovepik":
				return [{key:'Price',value:this.get_price_by_price_id(13)}]
				break;
			case "stockgraphics": // link not work
				return [{key:'Price',value:this.get_price_by_price_id(14)}]
				break;
			case "storeshock": // link not work
				//return 14
				break;				
			case "pixelsquid": //rong angle
				return [{key:'Price',value:this.get_price_by_price_id(15)}]  
				break;
			case "rawpixel":
				return [{key:'Price',value:this.get_price_by_price_id(16)}]
				break;	
			case "poweredtemplate":
				return [{key:'Price',value:this.get_price_by_price_id(17)}]
				break;							
			case "pikbest":
				return [{key:'Price',value:this.get_price_by_price_id(18)}]
				break;							
			case "icon8photo":
				return [{key:'Price',value:this.get_price_by_price_id(19)}]
				break;
			case "graphicpear":
				return [{key:'Price',value:this.get_price_by_price_id(20)}]
				break;
			case "OOOPic": // link not work
				return [{key:'Price',value:this.get_price_by_price_id(21)}]
				break;
			case "soundsnap":
				return [{key:'Price',value:this.get_price_by_price_id(29)}]
				break;
			case "motionarray":
				return [{key:'Price',value:this.get_price_by_price_id(32)}]
				break;
			case "motionarray":
				return [{key:'Price',value:this.get_price_by_price_id(30)}]
				break;																						
		}
	}

	get_price_by_price_id(price_id){
		for(var price_row of global.MM.photo_price){
			if(price_row.price_id==price_id){
				return price_row.price;
			}
		}
		for(var price_row of global.MM.video_price){
			if(price_row.price_id==price_id){
				return price_row.price;
			}
		}
		for(var price_row of global.MM.music_price){
			if(price_row.price_id==price_id){
				return price_row.price;
			}
		}					
	}

    delay(time){
        return new Promise((res,rej)=>{
            setTimeout(()=>{res()},time)
        })
    }


}

module.exports= new Manager_Get_Stocks
