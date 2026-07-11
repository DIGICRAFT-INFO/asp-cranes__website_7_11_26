import Breadcrumbs from '@/components/Breadcrumbs'
import React from 'react'
import whoweare2 from "@/public/homepage/whoweare2.jpg";
import WhyChooseUs from './WhyChooseUs';
import hero1 from "@/public/homepage/hero1.jpg"
import Contact from '@/homepage/Contact';
import GeneralConstruction from './GeneralConstruction';

export default function page() {
  return (
    <div>
      <Breadcrumbs
              breadcrumbImage={hero1}
              title="Services"
              breadcrumbLabel="Services"
              parentPages={[
                { label: "Home", href: "/" },
            
              ]}
            />
            <GeneralConstruction/>
            <WhyChooseUs/>
            <Contact/>
    </div>
  )
}
