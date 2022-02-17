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
			var price=this.get_price_by_media_type_and_site(data.result.itemType,data.result.itemSite)
			console.log(price)
			data.result.price=price
			return data			
		}catch(err){
			return {error:true}
		}
	}

	get_price_by_media_type_and_site(media_type,site){
		switch(media_type){
			case "Premium photo":
			case "Free vector":
			case "Free vector":
			case "photo":
			case "Free photo":
			case "elementenvato_standard":
			case "dreamstime_standard":
				for(var price_row of global.MM.photo_price){
					if(site.toUpperCase()==price_row.link.toUpperCase()){
						return price_row.price;
						break
					}
				}
				break;
		}
	}

    delay(time){
        return new Promise((res,rej)=>{
            setTimeout(()=>{res()},time)
        })
    }


}

module.exports= new Manager_Get_Stocks
