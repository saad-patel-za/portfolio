'use client';
/* eslint-disable next/no-img-element -- Static hosting uses optimized local WebP images. */

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects, skills, credentials } from './portfolio-data';
import Sculpt from './sculpt';
import Galaxy from './galaxy';
import './galaxy.css';

const Arrow = () => <span aria-hidden="true">↗</span>;

export default function Home() {
  const root = useRef<HTMLElement>(null);
  const [motion, setMotion] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const frame = requestAnimationFrame(() => setMotion(!query.matches));
    const sync = () => setMotion(!query.matches);
    query.addEventListener('change', sync);
    return () => { cancelAnimationFrame(frame); query.removeEventListener('change', sync); };
  }, []);
  useEffect(() => {
    if (!motion) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from('.hero-line > span', {yPercent:110, rotate:3, duration:1.15, stagger:.13, ease:'power4.out'});
      gsap.from('.hero .eyebrow, .hero-bottom', {opacity:0, y:18, duration:1, delay:.4});
      gsap.utils.toArray<HTMLElement>('.reveal').forEach(el => {
        gsap.from(el, {y:50, opacity:0, duration:.9, ease:'power3.out', scrollTrigger:{trigger:el,start:'top 94%',once:true}});
      });
      gsap.to('.reading-progress', {scaleX:1, ease:'none', scrollTrigger:{trigger:document.documentElement,start:'top top',end:'bottom bottom',scrub:true}});
      gsap.to('.sculpt-wrap', {y:100, rotation:9, ease:'none', scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
      gsap.utils.toArray<HTMLElement>('.project-image').forEach(el => {
        gsap.from(el, {scale:.95, rotateX:5, transformPerspective:1200, ease:'none', scrollTrigger:{trigger:el,start:'top bottom',end:'top 45%',scrub:1}});
      });
      gsap.utils.toArray<HTMLElement>('.skill-tags').forEach(el => {
        gsap.from(el.children, {y:22, opacity:0, stagger:.045, duration:.6, ease:'back.out(1.5)', scrollTrigger:{trigger:el,start:'top 90%',once:true}});
      });
      gsap.from('.contact-headline', {y:60, ease:'none', scrollTrigger:{trigger:'.contact',start:'top bottom',end:'top 35%',scrub:1}});
    }, root);
    return () => ctx.revert();
  }, [motion]);
  return <main ref={root} className={motion ? '' : 'motion-off'}>
    <Galaxy enabled={motion}/>
    <a className="skip-link" href="#work">Skip to selected work</a>
    <div className="reading-progress" aria-hidden="true"/>
    <header className="nav wrap">
      <a className="logo" href="#top" aria-label="Saad Patel home">saad<span>®</span></a>
      <nav aria-label="Main navigation"><a href="#work">Selected work <sup>08</sup></a><a href="#about">About me</a><a href="#contact" className="nav-contact">Let’s talk <Arrow/></a></nav>
    </header>
    <section className="hero wrap" id="top">
      <p className="eyebrow"><span className="status-dot"/> SAAD PATEL · SENIOR WEB DEVELOPER</p>
      <h1><span className="hero-line"><span>Good design.</span></span><span className="hero-line muted"><span>Great code.</span></span><span className="hero-line"><span><em>Real impact.</em></span></span></h1>
      <div className="sculpt-wrap"><Sculpt enabled={motion}/><span className="sculpt-caption">CODE MEETS CRAFT / 001</span><div className="sculpt-coordinate" aria-hidden="true">[ SP / 3D ]</div></div>
      <div className="hero-bottom"><p>I turn ambitious ideas into distinctive digital experiences.<br/>Shopify, custom websites & everything in between.</p><a className="round-link" href="#work">Explore my work <span>↘</span></a></div>
      <div className="hero-footnote"><span>BASED IN PAKISTAN · WORKING GLOBALLY</span><button onClick={() => setMotion(v => !v)} aria-pressed={motion}>Motion {motion ? 'on ◉' : 'off ○'}</button><span>SCROLL TO DISCOVER ↓</span></div>
    </section>
    <div className="ticker" aria-hidden="true"><div className="ticker-track"><span>FIGMA TO FUNCTION <b>✳</b> SHOPIFY & BEYOND <b>✳</b> DETAILS MAKE THE DIFFERENCE <b>✳</b></span><span>FIGMA TO FUNCTION <b>✳</b> SHOPIFY & BEYOND <b>✳</b> DETAILS MAKE THE DIFFERENCE <b>✳</b></span></div></div>
    <section className="work wrap" id="work">
      <div className="section-top reveal"><p className="eyebrow">01 / SELECTED WORK</p><span className="section-note">A selection of websites I’ve helped bring to life.</span></div>
      <div className="section-heading reveal"><h2>Built with purpose.<br/><span className="muted">Crafted with care.</span></h2><span className="work-count">(08)</span></div>
      <div className="project-grid">{projects.map((p,i) => <article className={`project reveal ${i===0 || i===4 ? 'project-wide' : ''}`} key={p.slug}>
        <a href={p.url} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${p.name} — ${p.type} (opens in a new tab)`}>
          <div className="project-image" style={{background:p.color}}><span className="project-number">/{p.year}</span><div className="browser-frame"><div className="browser-chrome"><span>● ● ●</span><span>{new URL(p.url).hostname}</span><Arrow/></div><div className="screen-crop"><img src={`projects/${p.slug}.webp`} alt={`${p.name} website design preview`} loading="lazy" width="1400" height={p.slug==='argentina-best-hunting'?4544:p.slug==='wandering-sauna'?3204:p.slug==='vosges'?6409:p.slug==='whitney-mariel'?9600:p.slug==='fundanglers'?6935:p.slug==='funnel-intelligence'?5795:p.slug==='corporate-av'?6039:11803}/></div></div><span className="project-visit">Visit website <Arrow/></span></div>
          <div className="project-info"><div><h3>{p.name}</h3><p>{p.type}</p></div><span className="project-scope">{p.scope} <Arrow/></span></div>
        </a>
      </article>)}</div>
    </section>
    <section className="about" id="about"><div className="wrap about-grid">
      <div className="about-intro reveal"><p className="eyebrow">02 / THE DEVELOPER BEHIND THE DETAILS</p><h2>A designer’s eye.<br/>A developer’s<br/><em>mindset.</em></h2><div className="experience-stat"><strong>5<span>+</span></strong><p>YEARS OF EXPERIENCE<br/>AND STILL CURIOUS.</p></div></div>
      <div className="about-copy reveal"><p className="large-copy">Hey, I’m Saad. I build websites that feel as good as they look.</p><p>My work lives at the intersection of thoughtful design and hands-on development. I translate Figma designs into responsive websites, custom storefronts, and product pages—with attention to the details that make each brand its own.</p><p>From Shopify Liquid and WordPress to React and custom PHP, I’m comfortable choosing the right tools and connecting the pieces behind the experience.</p><div className="current-role"><span className="status-dot"/><div><span className="eyebrow">CURRENTLY</span><strong>Senior Web Developer</strong><a href="https://funnelintelligencegroup.com/" target="_blank" rel="noopener noreferrer">Funnel Intelligence Group <Arrow/></a><small>USA-based company</small></div></div><a className="text-link" href="https://www.linkedin.com/in/saad-patel-139800239/" target="_blank" rel="noopener noreferrer">More about me on LinkedIn <Arrow/></a></div>
    </div></section>
    <section className="expertise wrap" id="expertise"><p className="eyebrow reveal">03 / MY TOOLKIT</p><h2 className="reveal">One developer.<br/><span className="muted">Many possibilities.</span></h2>{skills.map((s,i)=><div className="skill-row reveal" key={s.title}><span className="eyebrow">0{i+1}</span><div><h3>{s.title}</h3><p>{s.detail}</p></div><div className="skill-tags">{s.items.map(item=><span key={item}>{item}</span>)}</div></div>)}</section>
    <section className="journey wrap" id="experience"><div className="journey-heading reveal"><p className="eyebrow">04 / EXPERIENCE</p><h2>Always building.<br/><span className="muted">Always evolving.</span></h2></div><div className="timeline">
      <div className="timeline-row reveal"><span className="period accent">CURRENT</span><div><h3>Senior Web Developer</h3><a href="https://funnelintelligencegroup.com/" target="_blank" rel="noopener noreferrer">Funnel Intelligence Group <Arrow/></a><p>USA-based company · Custom web development</p></div><span className="role-index">01</span></div>
      <div className="timeline-row reveal"><span className="period">2025</span><div><h3>CMS Developer</h3><span>Ossols Private Limited</span><p>Figma to React, Shopify & WordPress. Wix, Squarespace & Webflow.</p></div><span className="role-index">02</span></div>
      <div className="timeline-row reveal"><span className="period">2022 — 2025</span><div><h3>Front End Developer</h3><span>Tekunity</span><p>Front-end development and Figma implementation across React, Shopify & WordPress.</p></div><span className="role-index">03</span></div>
    </div></section>
    <section className="learning wrap"><div className="reveal"><p className="eyebrow">05 / KEEP LEARNING</p><h2>Curiosity,<br/><em>with credentials.</em></h2><div className="education"><span className="eyebrow">EDUCATION</span><h3>Virtual University of Pakistan</h3><p>2021 — 2025</p><h3>Govt. Boys Degree College, Bufferzone</h3><p>2018</p></div></div><div className="certificates reveal"><span className="eyebrow">COURSEWORK & CERTIFICATIONS</span><div className="course"><span>01</span><h3>Introduction to Web Development with HTML, CSS, Git and GitHub</h3></div><div className="course"><span>02</span><h3>Developing Front-End Apps with React</h3></div><div className="course"><span>03</span><h3>Developing Back-End Apps with Node.js and Express</h3></div><p className="certificate-label">Coursera certificate verification</p><div className="credential-links">{credentials.map((id,i)=><a href={`https://www.coursera.org/account/accomplishments/verify/${id}`} key={id} target="_blank" rel="noopener noreferrer"><span>Certificate 0{i+1}<small>{id}</small></span><Arrow/></a>)}</div></div></section>
    <footer className="contact" id="contact"><div className="wrap"><div className="section-top"><p className="eyebrow">HAVE SOMETHING IN MIND?</p><span className="eyebrow">LET’S MAKE IT HAPPEN.</span></div><a className="contact-headline" href="mailto:Saadpatel5000@gmail.com">Let’s build<br/><em>something great.</em><span>↗</span></a><div className="contact-links"><a href="mailto:Saadpatel5000@gmail.com">Saadpatel5000@gmail.com <Arrow/></a><a href="tel:+923152177172">+92 315 2177172 <Arrow/></a><a href="https://www.linkedin.com/in/saad-patel-139800239/" target="_blank" rel="noopener noreferrer">LinkedIn <Arrow/></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Saad Patel</span><span>DESIGNED WITH INTENT. BUILT WITH CARE.</span><a href="#top">Back to top ↑</a></div></div></footer>
  </main>;
}
