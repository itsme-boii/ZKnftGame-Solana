/* ----------------- To upload Image and Metadata To pinata ----------------- */

export const uploadToPinata = async (imageFile: File|null, metadataFields:JSON|null, address: string|null, isMetadata:boolean=false) => {
  const pinataApiKey = 'f0d92e919281f5bb8707';
  const pinataSecretApiKey = '5199b4c05878272e5f76841dad485e42f727742d763b67448b95df3f59fce8cb';
  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

  try {
    if(!isMetadata && imageFile){
      const formData = new FormData();
      formData.append('file', imageFile);
      const options = {
        method: 'POST',
        headers: {
          'pinata_api_key': pinataApiKey,
          'pinata_secret_api_key': pinataSecretApiKey,
        },
        body: formData,
      };
      const result = await fetch(url, options);
      const imageData = await result.json();
      const imageUrl = imageData.IpfsHash;
      console.log("imageUrl is ",imageUrl);
      return imageUrl;
    }

    if(isMetadata && metadataFields){
      const metadataUrl = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
      const metadataOptions = {
        method: 'POST',
        headers: {
          'pinata_api_key': pinataApiKey,
          'pinata_secret_api_key': pinataSecretApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadataFields),
      };
      const metadataResult = await fetch(metadataUrl, metadataOptions);
      const metadataData = await metadataResult.json();
      console.log("metadataData is ",metadataData);
      return metadataData.IpfsHash;
    }
    
  } catch (error) {
    console.error('Error uploading Image to Pinata:', error);
  }


  
};


