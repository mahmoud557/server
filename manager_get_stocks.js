class Manager_Get_Stocks{
	constructor(props) {
		this.auth='eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvZ2V0c3RvY2tzLm5ldFwvYXBpXC9hdXRoXC9sb2dpbiIsImlhdCI6MTY0NDk3MDc2MCwibmJmIjoxNjQ0OTcwNzYwLCJqdGkiOiI1TzAyMFp2Wkk3ajNCYWpLIiwic3ViIjoyNzk5LCJwcnYiOiIyM2JkNWM4OTQ5ZjYwMGFkYjM5ZTcwMWM0MDA4NzJkYjdhNTk3NmY3In0.AX6n8xko7w_RixAzrYC4uoqaGNk0dFaWOlx2aSkcsI8'
	}

	async get_url_info(url){
		try{
	 		var response = await fetch(
	 			`https://getstocks.net/api/v1/getinfo?token=${this.auth}&link=${url}&ispre=0`,
	 			{method: 'POST'}
			);
			const data = await response.json()
			var price_id=this.get_price_id(data)
			var price=this.get_price_by_price_id(price_id)
			data.result.price=price
			return data			
		}catch(err){
			console.log(err)
			return {error:true}
		}
	}

	get_price_id(respond_object){
		if(!respond_object.result.provSlug){return new Error('cant ditict site')}
		switch(respond_object.result.provSlug){
			case "shutterstock":
				if(!respond_object.result.itemType){return new Error('cant ditict mdia')}
				if(respond_object.result.itemType=="photo"){return 1}
				if(respond_object.result.itemType=="illustration"){return 1}
				if(respond_object.result.itemType=="audio"){return 204}
				if(respond_object.result.itemType=="video"){ //not work
					if(!respond_object.result.is_footage_select){return [{'HD':100},{"4K":120}]}
					if(respond_object.result.is_footage_select){return [{'HD':110},{"4K":22}]}
				}
				break;
			case "adobestock":
				if(respond_object.result.is_image){return 60}
				if(respond_object.result.is_audio){return 205}
				if(respond_object.result.is_video){return "video"} //link not work
				return new Error('cant ditict mdia')			
				break;
			case "istockphoto":
				if(respond_object.result.itemExt=="jpg"){return 7}// link not work
				if(respond_object.result.itemExt=="eps"){return 7} // link not work
				if(respond_object.result.itemExt=="mov"){return 'video'} // link not work
				//if(respond_object.result.itemExt=="zip"){return "audio"}
				return new Error('cant ditict mdia')			
				break;			
			case "depositphotos":
				if(respond_object.result.itemExt=="jpg"){return 5}
				if(respond_object.result.itemExt=="eps"){return 5}
				if(respond_object.result.itemExt=="mov"){return 27}
				//if(respond_object.result.itemExt=="zip"){return "audio"} // link not work
				return new Error('cant ditict mdia')			
				break;
			case "storyblocks":
				return 10
				break;					
				break;
			case "freepik":
				return 2
				break;
			case "123rf":
				return 3
				break;
			case "alamy":
				return 4
				break;
			case "dreamstime":
				return 8
				break;
			case "pngtree":
				return 9
				break;
			case "vecteezy":
				return 1313
				break;
			case "vectorgrove":
				return 11
				break;
			case "vectorstock":
				return 12
				break;
			case "vexels":
				return 70
				break;
			case "lovepik":
				return 13
				break;
			case "stockgraphics": // link not work
				return 14
				break;
			case "storeshock": // link not work
				//return 14
				break;				
			case "pixelsquid": //rong angle
				return 15  
				break;
			case "rawpixel":
				return 16
				break;	
			case "poweredtemplate":
				return 17
				break;							
			case "pikbest":
				return 18
				break;							
			case "icon8photo":
				return 19
				break;
			case "graphicpear":
				return 20
				break;
			case "OOOPic": // link not work
				return 21
				break;
			case "soundsnap":
				return 29
				break;
			case "motionarray":
				return 32
				break;
			case "motionarray":
				return 30
				break;																						
		}
	}

	get_price_by_price_id(price_id){
		for(var price_row of global.MM.photo_price){
			if(price_row.price_id==price_id){
				return price_row.price;
				break
			}
		}
		for(var price_row of global.MM.video_price){
			if(price_row.price_id==price_id){
				return price_row.price;
				break
			}
		}
		for(var price_row of global.MM.music_price){
			if(price_row.price_id==price_id){
				return price_row.price;
				break
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
