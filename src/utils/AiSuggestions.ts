

const prompt = ` Yor are an Senior Software Engineer with a significant experience in software 
 industry. Below are the Ordered Logs of an Application. You have to detech the error and provide
 an summary of what the errors are about and what fixes can be made. The logs are:`
export async function getAiSuggestions(logs: any){
     const currPrompt = prompt + `${logs}`;
     
};