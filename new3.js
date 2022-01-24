const inp = document.getElementById("inp");
const display = document.getElementById("display")
let phrase;
inp.addEventListener("keyup",(evt)=>{
    if(evt.keyCode==13){
        if(inp.value.trim().length>0){
            phrase = inp.value;
            console.clear();
            ga_init(test(randPop(100)),[]);
        }
    }
})

function ga_init(pop,arr){
    let newPop = pop;
    let ga = setInterval(()=>{
        if(newPop[0].value!==phrase){
            for(let i=0;i<1000000;i++){
                let parents = [newPop[0],newPop[1]];
                let elites = elite(2,newPop);
                let children = crossOver(parents);
                let mutant = mutate(0.3,parents[1]);
                newPop = elites.concat(children);
                newPop.push(mutant);
                newPop.sort((a, b) => (a.score < b.score ? 1 : -1));
                //console.clear();
                //console.log(newPop[0]);
                arr = getUnique(arr.concat(newPop).sort((a, b) => (a.score > b.score ? 1 : -1)),"value")
                if(newPop[0].value==phrase){
                    break;
                }
            }
        }
        else{
            let gens = genify(arr,20).sort((a, b) => (a.score < b.score ? 1 : -1));
            console.log(gens);
            display.innerHTML="";
            for(let i=0;i<gens.length;i++){
                display.innerHTML+=`<div class="gen" style="width:fit-content;display:flex;justify-content:space-between;align-items:center"><span style="margin:10px;">Gens: ${gens[i].gen}</span> <span style="margin:10px;">Value: ${gens[i].value}</span> <span style="margin:10px;">Score: ${gens[i].score}</span> </div>`;
                let gens_ = document.getElementsByClassName("gen")
                gens_[0].style.color="springgreen";
                if(gens.length-1==i){
                    gens_[gens_.length-1].style.color="red";
                }
            }
            display.classList.add("done")
            clearInterval(ga);
        }
    },1)
}

function getUnique(arr, key) {
    return [...new Map(arr.map((item) => [item[key], item])).values()];
}

function genify(arr,n){
    let temp = [];
    for(let i=0;i<arr.length;i++){
        if(i % n == 0||arr[i].value==phrase){
            temp.push({"gen":i,"value":arr[i].value,"score":arr[i].score})
        }
    }
    return temp;
}

function randomIndx(thing,avoid1,avoid2){
    let val;
    do {
        val = Math.floor(Math.random() * thing.length);
    }
    while (avoid1.includes(val)||avoid2.includes(val));
    return val;
}

function mutate(prob,entity){
    let choice = probability(prob);
    if(choice){
        let value = entity.value;
        //let index = Math.floor(Math.random() * value.length)
        let index = randomIndx(value,entity.correct,[]);
        let pom = value[index];
        let group = type(pom,true);
        let prev = group.indexOf(pom);
        let loc = group.indexOf(pom);
        let dice = Math.random() < 0.5;
        if(dice){if(loc!==group.length-1){loc+=1}else{loc-=1}}else{if(loc!==0){loc-=1}else{loc+=1;}}
        let mutant = {"value":value.replaceAt(index,group[loc]),"score":fitness(value.replaceAt(index,group[loc]))["score"],"correct":fitness(value.replaceAt(index,group[loc]))["correct"]};
        return mutant;
    }
    return entity;
}

function probability(n){
    return Math.random() < n;
}


function crossOver(parents){
    let mother = parents[0].value;
    let father = parents[1].value;
    let motherCorr = parents[0].correct;
    let fatherCorr = parents[1].correct;
    let randPoint = Math.floor(Math.random() * mother.length)
    //let randPoint = randomIndx(mother,motherCorr,fatherCorr);
    let string1 = fitness(mother.replaceAt(randPoint,father[randPoint]));
    let string2 = fitness(father.replaceAt(randPoint,mother[randPoint]));
    let formatted = [string1,string2].sort((a, b) => (a.score < b.score ? 1 : -1));
    return formatted;
}

function elite(max,pop){
    let temp = [];
    for(let i=2;i<max;i++){
        temp.push(pop[i]);
    }
    return temp;
}

function closeness(entity,actual){
    let group = type(actual,true);
    let actualIndx = group.indexOf(actual);
    let entityIndx = group.indexOf(entity);
    return Math.abs(actualIndx - entityIndx);
}

function fitness(entity){
    let correct = [];
    let score = 0;
    for(let i=0;i<entity.length;i++){
        if(phrase[i]==entity[i]){
            score++;
            score++;
            correct.push(i);
        }
        score+=-(closeness(entity[i],phrase[i]))
    }
    return {"value":entity,"score":score,"correct":correct}
}

function test(pop){
    let temp = [];
    for(let i=0;i<pop.length;i++){
        temp.push({"value":pop[i],"score":fitness(pop[i])["score"],"correct":fitness(pop[i])["correct"]})
    }
    temp.sort((a, b) => (a.score < b.score ? 1 : -1));
    return temp;
}

function randPop(pop){
    let temp = [];
    for(let i=0;i<pop;i++){
        temp.push(randEntity());
    }
    return temp;
}

function randEntity(){
    let max = phrase.length;
    let temp = ``;
    for(let i=0;i<max;i++){
        let group = type(phrase[i],true);
        let rand = Math.floor(Math.random() * group.length);
        temp += group[rand];
    }
    return temp;
}

function type(value,res){
    let symbols=` !@#$%^&*()_-+={}[]\|'";:.><,/?`;
    let numbers=`1234567890`;
    let letters = "abcdefghijklmnopqrstuvwxyz";
    let cap = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let all = [symbols,numbers,letters,cap];
    if(res==undefined){
        if(symbols.includes(value)){
            return 0;
        }
        else if(numbers.includes(value)){
            return 1;
        }
        else if(letters.includes(value)){
            return 2;
        }
        else if(cap.includes(value)){
            return 3;
        }
        else{
            console.log(value)
            return false;
        }
    }
    else if(res){
        let index = type(value);
        return all[index];
    }
}

String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}
