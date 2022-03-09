function test(arr,num){
	for(i=0;i<arr.length-1;i++){
		if(arr[i]+arr[i+1]==num){
			return true;
		}
	}
	return false
}