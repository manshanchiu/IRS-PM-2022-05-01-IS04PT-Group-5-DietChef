## SECTION 1 : PROJECT TITLE
## DietChef - Intelligent Diet Assistant System
<p align="center">
<img src="SystemCode/data/logo.png"
     style="float: left; margin-right: 0px;" />
</p>


---

## SECTION 2 : EXECUTIVE SUMMARY / PAPER ABSTRACT
DietChef seeks to provide all users a simple, reliable and transparent recipe cookbook platform. Users can access and interact with DietChef easily via Telegram. DietChef would score the recipe from the database and provide the meal calories, ingredients, cooking instruction for the user. DietChef also seek to help you achieve your health goals by providing your calorie intake making your nutritional logging easier. DietChef would take your previous recipe preference and item inventory to recommend your next cooking experience, saving you time and effort to visiting multiple recipe website that fits your taste preference and inventory.

Project DietChef will provide a viable product for user to access and interact on Telegram, a widely popular Messaging System platform. The key highlights of DietChef are using Elastic Search for storing data and providing real-time search, recommend a recipe based on similarity score and YOLOv5 for object detection. Using YOLOv5 object detection, users are able to quickly onboard their ingredients to search for a recipe which best matches what they have.

We also realised the world produces enough food to nourish every man, woman and child on the planet. However, there is still roughly USD$1 trillion dollars of food that are wasted and lost because of edible food that is thrown away by consumers. According to USDA’s Economic Research Service , roughly 30 to 40 percent are wasted in the United States alone. At the consumer level, people buy more than they need and then throw out unused food because they are unsure what to cook with the unused food. This amounts to more than 240 pounds of annual food wastage per person. We hope Dietchef can be the platform to rise the people awareness and provide a bridge to allow them to step out. We believe this small step can be a big step tomorrow.


---

## SECTION 3 : CREDITS / PROJECT CONTRIBUTION

| Official Full Name  | Student ID (MTech Applicable)  | Work Items (Who Did What) | 
| :------------ |:---------------:| :-----|
| Cheo Hao | A0146967L | 1)Market Research and Business Analysis<br/>2)Recipe Database Collection<br/>3)Database Pre-processing and Structure Arrangement<br/>4)User Input Keyword Extraction<br/>5)Report Writing and Video Preparation| 
| Chiu Man Shan | A0249252A | 1)System Architecture<br/>2)Text Search Algorithm<br/>3)Rule based information extraction <br/>4)Telegram Chatbot<br/> 5)Project deployment| 
| Kuch Swee Cheng | A0249246X | 1)Implement ingredient object detection using YOLOv5<br/>2)Trained custom image dataset<br/>3)Explored using Nvidia Jetson Nano SBC, edge server image inference and object detection. |
| Zhao Lutong | A0249279L | 1)Implement Content-based Recommendation Engine <br/>2)Implement similarity matching evaluation using two distance metrics<br/>3)Retrieve the top N highest scoring recipes, aggregate their nutrition metadata information<br>4)Pre-compute most top-N recommended recipe for all existing recipes in the database on a regular basis and store it as JSON in Elastic Search| 

---

## SECTION 4 : VIDEO OF SYSTEM MODELLING & USE CASE DEMO

[Business Video](https://www.youtube.com/watch?v=W9xtdFcULBM)
<br/>
[Technical Video](https://www.youtube.com/watch?v=Nli73PCvKNI)
<br/>
[Demo Video](https://www.youtube.com/watch?v=W9xtdFcULBM)

---

## SECTION 5 : USER GUIDE

Refer to project report at Github Folder: ProjectReport -> [User and Installation guide.pdf](ProjectReport/User%20and%20Installation%20guide.pdf)


---
## SECTION 6 : PROJECT REPORT / PAPER

`Refer to project report at Github Folder: ProjectReport`
