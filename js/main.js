/* ============================
        UNION ROLEPLAY
============================ */

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {

    if(window.scrollY > 60){

        navbar.style.background="rgba(8,8,12,.92)";
        navbar.style.boxShadow="0 15px 40px rgba(0,0,0,.45)";
        navbar.style.borderColor="#8B5CF6";

    }

    else{

        navbar.style.background="rgba(10,10,15,.75)";
        navbar.style.boxShadow="none";
        navbar.style.borderColor="rgba(139,92,246,.15)";

    }

});


/* ============================
      SMOOTH SCROLL
============================ */

document.querySelectorAll('a[href^="#"]').forEach(anchor=>{

    anchor.addEventListener("click",function(e){

        e.preventDefault();

        document.querySelector(this.getAttribute("href")).scrollIntoView({

            behavior:"smooth"

        });

    });

});


/* ============================
      REVEAL ANIMATION
============================ */

const observer=new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("show");

}

});

});

document.querySelectorAll(".card,.rule-card,.stat-box").forEach(el=>{

el.classList.add("hidden");

observer.observe(el);

});


/* ============================
      NUMBER COUNTERS
============================ */

const counters=document.querySelectorAll(".stat-box h1");

const speed=80;

counters.forEach(counter=>{

const update=()=>{

const target=counter.innerText;

const number=parseInt(target);

if(isNaN(number)) return;

let current=+counter.getAttribute("data-count")||0;

const increment=Math.ceil(number/speed);

if(current<number){

current+=increment;

counter.setAttribute("data-count",current);

counter.innerText=current+"+";

requestAnimationFrame(update);

}else{

counter.innerText=target;

}

}

update();

});


/* ============================
      PARALLAX HERO
============================ */

window.addEventListener("mousemove",(e)=>{

const hero=document.querySelector(".hero");

const x=(window.innerWidth/2-e.pageX)/60;

const y=(window.innerHeight/2-e.pageY)/60;

hero.style.backgroundPosition=`${x}px ${y}px`;

});


/* ============================
      BACK TO TOP
============================ */

const topBtn=document.createElement("div");

topBtn.className="topButton";

topBtn.innerHTML='<i class="fa-solid fa-arrow-up"></i>';

document.body.appendChild(topBtn);

window.addEventListener("scroll",()=>{

if(window.scrollY>500){

topBtn.classList.add("active");

}else{

topBtn.classList.remove("active");

}

});

topBtn.onclick=()=>{

window.scrollTo({

top:0,

behavior:"smooth"

});

};


/* ============================
      PAGE LOADER
============================ */

window.onload=()=>{

document.body.classList.add("loaded");

};