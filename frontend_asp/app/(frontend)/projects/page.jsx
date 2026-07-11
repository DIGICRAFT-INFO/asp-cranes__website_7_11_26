import React from 'react'
import banner from "@/public/about/banner.jpg"
import Breadcrumbs from '@/components/Breadcrumbs'
import Projects from './Projects'

export default function page() {
  return (
    <div>
       <Breadcrumbs
        breadcrumbImage={banner}
        title="Projects"
        breadcrumbLabel="Projects"
        parentPages={[{ label: "Home", href: "/" }]}
      />
      <Projects/>
    </div>
  )
}
