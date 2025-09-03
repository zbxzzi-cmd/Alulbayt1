import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import ThemeToggle from "./ThemeToggle";

const DesignSystemDemo = () => {
  return (
    <div className="ds-bg-main">
      {/* Theme Toggle - Top Right Corner */}
      <div className="fixed top-4 right-4 z-[9999]">
        <ThemeToggle />
      </div>
      
      <div className="max-w-6xl mx-auto py-12 px-6">
        <div className="text-center mb-12">
          <h1 className="ds-heading-xl ds-mb-lg">Ahlulbayt Studies Design System</h1>
          <p className="ds-body-lg">Comprehensive design system demonstrating all components and styles</p>
        </div>

        {/* Typography Section */}
        <div className="ds-bg-glass ds-p-xl ds-mb-xl" style={{ borderRadius: 'var(--radius-lg)' }}>
          <h2 className="ds-heading-lg ds-mb-lg">Typography System</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="ds-heading-md ds-mb-md">Headings</h3>
              <h1 className="ds-heading-xl ds-mb-sm">Heading XL</h1>
              <h2 className="ds-heading-lg ds-mb-sm">Heading Large</h2>
              <h3 className="ds-heading-md ds-mb-sm">Heading Medium</h3>
              <h4 className="ds-heading-sm ds-mb-sm">Heading Small</h4>
            </div>
            <div>
              <h3 className="ds-heading-md ds-mb-md">Body Text</h3>
              <p className="ds-body-lg ds-mb-sm">Body Large - Used for hero subtitles and important content</p>
              <p className="ds-body-md ds-mb-sm">Body Medium - Standard body text for most content</p>
              <p className="ds-body-sm ds-mb-sm">Body Small - Used for captions and secondary information</p>
            </div>
          </div>
        </div>

        {/* Card System */}
        <div className="ds-bg-glass ds-p-xl ds-mb-xl" style={{ borderRadius: 'var(--radius-lg)' }}>
          <h2 className="ds-heading-lg ds-mb-lg">Card System</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="ds-card-base ds-card-aqua">
              <CardHeader>
                <CardTitle className="ds-heading-sm">Aqua Card</CardTitle>
                <CardDescription className="ds-body-sm">Informational content</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="ds-body-md">Used for cool, informational content and primary features.</p>
              </CardContent>
            </Card>

            <Card className="ds-card-base ds-card-pink">
              <CardHeader>
                <CardTitle className="ds-heading-sm">Pink Card</CardTitle>
                <CardDescription className="ds-body-sm">Interactive content</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="ds-body-md">Used for interactive elements and attention-grabbing content.</p>
              </CardContent>
            </Card>

            <Card className="ds-card-base ds-card-orange">
              <CardHeader>
                <CardTitle className="ds-heading-sm">Orange Card</CardTitle>
                <CardDescription className="ds-body-sm">Warning content</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="ds-body-md">Used for warnings, highlights, and important notices.</p>
              </CardContent>
            </Card>

            <Card className="ds-card-base ds-card-green">
              <CardHeader>
                <CardTitle className="ds-heading-sm">Green Card</CardTitle>
                <CardDescription className="ds-body-sm">Success content</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="ds-body-md">Used for success states and positive outcomes.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Button System */}
        <div className="ds-bg-glass ds-p-xl ds-mb-xl" style={{ borderRadius: 'var(--radius-lg)' }}>
          <h2 className="ds-heading-lg ds-mb-lg">Button System</h2>
          <div className="flex flex-wrap gap-4">
            <button className="ds-btn-base ds-btn-primary">Primary Button</button>
            <button className="ds-btn-base ds-btn-secondary">Secondary Button</button>
            <Button variant="outline" className="ds-btn-base ds-btn-secondary">Shadcn Button</Button>
          </div>
        </div>

        {/* Form System */}
        <div className="ds-bg-glass ds-p-xl ds-mb-xl" style={{ borderRadius: 'var(--radius-lg)' }}>
          <h2 className="ds-heading-lg ds-mb-lg">Form System</h2>
          <div className="ds-form-container max-w-md">
            <form>
              <div className="ds-mb-lg">
                <label className="ds-form-label">Email Address</label>
                <input 
                  type="email" 
                  className="ds-form-input" 
                  placeholder="Enter your email"
                />
              </div>
              <div className="ds-mb-lg">
                <label className="ds-form-label">Password</label>
                <input 
                  type="password" 
                  className="ds-form-input" 
                  placeholder="Enter your password"
                />
                <div className="ds-form-error">This field is required</div>
              </div>
              <div className="ds-mb-lg">
                <label className="ds-form-label">Confirm Password</label>
                <input 
                  type="password" 
                  className="ds-form-input" 
                  placeholder="Confirm your password"
                />
                <div className="ds-form-success">Passwords match!</div>
              </div>
              <button type="button" className="ds-btn-base ds-btn-primary w-full">
                Submit Form
              </button>
            </form>
          </div>
        </div>

        {/* Animation System */}
        <div className="ds-bg-glass ds-p-xl ds-mb-xl" style={{ borderRadius: 'var(--radius-lg)' }}>
          <h2 className="ds-heading-lg ds-mb-lg">Animation System</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="ds-card-base ds-card-aqua ds-p-lg ds-animate-fade-in">
              <h3 className="ds-heading-sm ds-mb-sm">Fade In</h3>
              <p className="ds-body-sm">Smooth fade-in animation</p>
            </div>
            <div className="ds-card-base ds-card-pink ds-p-lg ds-animate-slide-up">
              <h3 className="ds-heading-sm ds-mb-sm">Slide Up</h3>
              <p className="ds-body-sm">Slide up with fade animation</p>
            </div>
            <div className="ds-card-base ds-card-green ds-p-lg ds-animate-bounce-in">
              <h3 className="ds-heading-sm ds-mb-sm">Bounce In</h3>
              <p className="ds-body-sm">Bouncy entrance animation</p>
            </div>
          </div>
        </div>

        {/* CMS Integration */}
        <div className="ds-bg-glass ds-p-xl" style={{ borderRadius: 'var(--radius-lg)' }}>
          <h2 className="ds-heading-lg ds-mb-lg">CMS Integration</h2>
          <div className="ds-card-base ds-card-orange ds-p-lg">
            <h3 className="ds-heading-sm ds-editable ds-mb-sm">Editable Heading</h3>
            <p className="ds-body-md ds-editable ds-mb-sm">This text is editable through the CMS. Hover to see the edit indicator.</p>
            <p className="ds-body-sm">All text content in the application can be edited by administrators through the content management system.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignSystemDemo;