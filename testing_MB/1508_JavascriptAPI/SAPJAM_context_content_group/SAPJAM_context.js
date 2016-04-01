/*
License
Copyright 2014, SAP AG

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
function make_SAPJAM_context_Call(){

	gadgets.sapjam.context.get(function(data) {
		console.log(data);
		var osapiOutput = "";
		osapiOutput += "<p></p>";
		osapiOutput += "<p>------------------------------------------------------------------------------------------</p>";
		osapiOutput += "<p><h2>gadgets.sapjam.context.get</h2></p>";
		osapiOutput += "<ul>";
		osapiOutput += "<li>data.<b>context</b> = " + data.context + "</li>";
		osapiOutput += "<li>data.<b>group.id</b> = " + data.group.id + "</li>";
		osapiOutput += "<li>data.<b>group.name</b> = " + data.group.name + "</li>";
		osapiOutput += "<li>data.<b>id</b> = " + data.id + "</li>";
		osapiOutput += "<li>data.<b>name</b> = " + data.name + "</li>";
		osapiOutput += "<li>data.<b>readOnly</b> = " + data.readOnly + "</li>";
		osapiOutput += "</ul>";
		osapiOutput += "<p>------------------------------------------------------------------------------------------</p>";
		osapiOutput += "<p></p>";
		$("body").append(osapiOutput);
	});
	
}

