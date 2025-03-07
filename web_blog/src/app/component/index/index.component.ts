import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps'; 
import * as data from '../../../assets/data.json';  
import { HttpClient } from '@angular/common/http';
import Lenis from '@studio-freight/lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { EmailService } from '../../service/email.service';
import { LoaderComponent } from '../loader/loader.component';
import { MsgBoxComponent } from '../msg-box/msg-box.component';
  
@Component({
  selector: 'app-index',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,DropdownComponent,LoaderComponent,MsgBoxComponent],
  templateUrl: './index.component.html',
  styleUrl: './index.component.scss'
})
export class IndexComponent implements AfterViewInit{

  contact_form!: FormGroup;
  techs = data.tech_languages;
  process_timeline = data.process_timeline
  code_challenges = data.code_challenges 
  project_types = data.project_types 
  isLoading = false
  statusMessage = { show: false, msg: '', status: '' };

  @ViewChild('lottieContainer', { static: true }) lottieContainer!: ElementRef;
  @ViewChild('fact') funFactContainer! : ElementRef; 
  private animation: any;
  private lenis!: Lenis ;  

  constructor(private fb: FormBuilder,private cdr:ChangeDetectorRef,private http : HttpClient,private email: EmailService){}
 
  ngOnInit(){ 
    this.initMap();
    this.contact_form = this.fb.group({
      name : ['',Validators.required],
      mail : ['',[Validators.required,Validators.email]],
      mobile : ['',[Validators.required,Validators.pattern(/^\d{10}$/)]],
      project_detail : ['',Validators.required],
      project_type : ['',Validators.required], 
      selected_details : this.fb.group({})
    });
    this.loadLottieAnimation();  
  }

    //Triggers the Status message to user using msg-box component
    updateStatusMessage(jsonData: any):void
    {
      var statusMessage ={
        show: true,
        msg: jsonData.message,
        status: jsonData.status
      }
      this.statusMessage = statusMessage;
    }

  ngAfterViewInit() {
      
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => 1 - Math.pow(1 - t, 3),  
    });

    var self = this;
    function raf(time: number) {
      self.lenis.raf(time);
      ScrollTrigger.update();
      requestAnimationFrame(raf);
    }
  
    requestAnimationFrame(raf.bind(this));
 
    this.getFunFact();
    this.initGSAP();  
    this.initAOS();
    this.animateContainer();
  } 

  // @HostListener('wheel', ['$event'])
  // @HostListener('touchmove', ['$event'])
  // preventLenisOnScroll(event: Event) {
  //   const target = event.target as HTMLElement;
  //   if (target.closest('.no-lenis-scroll')) {
  //     event.stopPropagation(); 
  //   }
  // }

  ngOnDestroy() {
    if (this.lenis) {
      this.lenis.destroy(); 
    }
  }

  initAOS()
  {
    AOS.init({
      duration: 800,  
      offset: 100,    
      easing: 'ease-in-out',
      once: false   
    });
  }

  initGSAP(){ 
    gsap.registerPlugin(ScrollTrigger)

    const sections = gsap.utils.toArray('.wrapper .container'); 
    if(sections)
    {
      sections.forEach((section : any)=> {
        gsap.to(section, {  
          opacity : 0,
          scale: 0.9,
          y: 50,  
          scrollTrigger: {
            trigger: section,
            scrub: 1.5, 
            start : "bottom center", 
            pin: true, // Keeps the section pinned
            pinSpacing: true, // Allows smooth spacing adjustments
            anticipatePin: 1, // Reduces stuttering during pinning
          }
        })
      }) 
    }
  }

  initMap()
  {
    const latitude = 13.052930 ,longitude = 80.159004;
    const map = new google.maps.Map(document.getElementById("gmap") as HTMLElement,  {
      mapId: "DEMO_MAP_ID", // Map ID is required for advanced markers.
        center: { lat: latitude, lng: longitude }, 
        zoom: 16,
        gestureHandling: 'cooperative',
        mapTypeId: google.maps.MapTypeId.ROADMAP, 
        streetViewControl: true, 
        fullscreenControl: true, 
      });   
      const marker =  new google.maps.marker.AdvancedMarkerElement({
      position: { lat: latitude, lng: longitude },
      map: map,
      title: 'Location',
    });
    const infoWindowContent = `
      <div style="font-size:8px;"> 
        <p><strong>Landmark:</strong>Near Kannimmal Kovil Vanagaram, CaptainTV backside</p>
        <p><strong>Address:</strong> 14D, Dhanakotti ammal 1st street, Valli ammal nagar, Vanagaram, Chennai</p> 
        <p><strong>Pincode:</strong> 600095</p>
        <p>
          <a href="https://maps.google.com/maps?daddr=${latitude},${longitude}" target="_blank" rel="noopener noreferrer" style="text-decoration:underline;color:blue;">
            Open in Google Maps
          </a>
        </p>
      </div>
    `;
    const infoWindow = new google.maps.InfoWindow({
      content: infoWindowContent,
    });
    infoWindow.open(map, marker);
  }

  onCategoryChange() {
    const selectedCategory = this.project_types.find((ele: any) => ele.type === this.contact_form.value.project_type); 
    const selectionsGroup = this.fb.group({}); 
    selectedCategory?.tech_requirement.forEach((element: string) => { 
      selectionsGroup.addControl(
        element,
        this.fb.control('Any', Validators.required) 
      );
    }); 
    this.contact_form.setControl('selected_details', selectionsGroup); 
  }

  isRequiredControlField(controlField: string): boolean {
    const projectType = this.contact_form.value.project_type;
    const project = this.project_types.find((ele: any) => ele.type === projectType);
    return project?.tech_requirement?.includes(controlField) ?? false;
  }
  

  getProjectTypes(jsonObject: any) : any[]
  {
    return jsonObject.map((ele: any)=>{ return ele.type});
  }

  handleActions(event: {"labelValue" : string,value : any})
  { 
    var selectionsGroup = this.contact_form.get('selected_details') as FormGroup;
    if(event.labelValue == "project-type")
    {
      this.contact_form.get('project_type')?.setValue(event.value);  
      this.onCategoryChange();
    }
    else
      selectionsGroup.get(event.labelValue)?.setValue(event.value); 
 
    this.cdr.detectChanges();
  }
 
  loadLottieAnimation() {
    this.animation = (window as any).lottie.loadAnimation({
      container: this.lottieContainer.nativeElement, 
      path: 'assets/up_arrow.json',  
      renderer: 'svg',
      autoplay: true,  
      loop: false         
    });
  }

  playAnimation() {
    this.animation.stop();
    this.animation.play(); 
  }

  getFunFact()
  {
    var element = this.funFactContainer.nativeElement
    this.http.get('https://api.api-ninjas.com/v1/facts',{ headers: { 'X-Api-Key': "LaaAo4t9/1ArbsDJceXJ4w==5guNyHiztKPcQuXz" } }).subscribe((jsonData: any)=>{
       element.innerText = jsonData[0].fact
    })
  }

  scrollToSection(sectionId: string): void { 
    const element = document.getElementById(sectionId);
    if (element && sectionId === "contact-form") {
      element.scrollIntoView({ behavior: 'smooth', block : "start"});
    }
    else  window.scrollTo({ top: 0, behavior: 'smooth' }); 
  } 

  triggerAnimations(element : any,triggerClass : any)
  {
    ScrollTrigger.create({
      trigger: element,
      start: "top 80%",
      onEnter: () => element.classList.add(triggerClass),
      onLeaveBack: () => element.classList.remove(triggerClass)
  });
  }

  animateContainer() {
    ScrollTrigger.create({
      trigger: ".process-container",
      start: "top 75%",
      onEnter: () => document.querySelector(".container_two")?.classList.add("animate"),
    });
  }

  sendMail()
  {
    if(this.contact_form.valid)
    {
      this.isLoading = true;
      var form = this.contact_form.value;  
      this.email.sendEmail(form.mail,form.name,this.getEmailTemplate(form)).then((json)=>{  
        var statusMessage = {message: "An unexpected error occurred!.Please try again after sometime...",status: "success"}
        if(json.status === 200) 
          statusMessage = {message: "Thanks for reaching out. We'll contact you soon!",status: "success"}
         this.updateStatusMessage(statusMessage)
        this.isLoading = false;
      }); 
    }
    else  
      this.contact_form.markAllAsTouched(); 
  }


  getEmailTemplate(data: any): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head><style>h3,h2{text-decoration: underline;}p{padding-left:20px;}</style></head>
    <body>
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>New Project Inquiry</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.mail}</p>
        <p><strong>Mobile:</strong> ${data.mobile}</p>
  
        <h3>Project Details:</h3>
        <p><strong>Project Type:</strong> ${data.project_type}</p>
        <p><strong>Description:</strong> ${data.project_detail}</p>
  
        <h3>Technical Preferences:</h3>
        <p><strong>Frontend:</strong> ${data.selected_details.frontend || 'N/A'}</p>
        <p><strong>Backend:</strong> ${data.selected_details.backend || 'N/A'}</p>
        <p><strong>Database:</strong> ${data.selected_details.database || 'N/A'}</p>
   
      </div>
      </body>
      </html>
    `;
  } 

  handleTechClick(event: Event,option: string) {
    const targetElement = event.target as HTMLElement;
    const parentElement = targetElement.closest('.sq-bg'); 
    
    if (parentElement) {
      option === "open" ? parentElement.classList.add("active") : option === "toggle" ? parentElement.classList.toggle('active') : parentElement.classList.remove('active'); 
    }
  }
  
}

