
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Monitor, Users, Video, FileText, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isHoveringCTA, setIsHoveringCTA] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal/20 to-cream z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-terracotta mb-4 animate-fadeIn">
                Relax Hotel Group Meeting Record Management System
              </h1>
              <p className="text-lg text-gray mb-8 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                Simplify how you store, access, and manage your virtual conference records with our intuitive platform.
              </p>
              <Button 
                size="lg" 
                className="bg-terracotta hover:bg-terracotta/90 text-cream group animate-fadeIn"
                style={{ animationDelay: '0.4s' }}
                onMouseEnter={() => setIsHoveringCTA(true)}
                onMouseLeave={() => setIsHoveringCTA(false)}
                onClick={() => navigate('/login')}
              >
                Get Started
                <ArrowRight className={`ml-2 transition-transform duration-300 ${isHoveringCTA ? 'translate-x-1' : ''}`} />
              </Button>
            </div>
            <div className="md:w-1/2 flex justify-center animate-fadeIn" style={{ animationDelay: '0.6s' }}>
              <img 
                src="https://i.imgur.com/JuCBjod.jpeg" 
                alt="Relax Hotel Group Meeting Management" 
                className="rounded-lg shadow-xl max-w-full h-auto" 
                style={{ maxHeight: '400px' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-terracotta mb-12">
            Powerful Features to Streamline Your Work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-white">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-full bg-gold/20 flex items-center justify-center mb-4">
                  <Video className="h-6 w-6 text-gold" />
                </div>
                <h3 className="text-xl font-semibold text-terracotta mb-2">Conference Recordings</h3>
                <p className="text-gray">Store and organize all your meeting videos in one secure location with easy access.</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-white">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-full bg-teal/20 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-teal" />
                </div>
                <h3 className="text-xl font-semibold text-terracotta mb-2">Meeting Notes</h3>
                <p className="text-gray">Automatically link meeting notes, outlines, and transcripts to each conference record.</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-white">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-full bg-terracotta/20 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-terracotta" />
                </div>
                <h3 className="text-xl font-semibold text-terracotta mb-2">User Management</h3>
                <p className="text-gray">Control access with three-tier permission levels to ensure data security and proper sharing.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-teal/10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-terracotta mb-12">
            What Our Users Say
          </h2>
          <div className="mx-auto max-w-4xl">
            <Carousel className="mx-auto">
              <CarouselContent>
                <CarouselItem>
                  <div className="p-6 bg-white rounded-lg shadow-md">
                    <p className="italic text-gray mb-4">"This platform has completely transformed how we manage our virtual conference records. The tiered access system is exactly what we needed."</p>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center mr-3">
                        <span className="text-white font-medium">JD</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Jane Doe</h4>
                        <p className="text-sm text-gray">Operations Manager</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem>
                  <div className="p-6 bg-white rounded-lg shadow-md">
                    <p className="italic text-gray mb-4">"The ability to quickly search through all meeting records has saved our team countless hours. The interface is intuitive and responsive."</p>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-terracotta flex items-center justify-center mr-3">
                        <span className="text-white font-medium">MS</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Michael Smith</h4>
                        <p className="text-sm text-gray">Finance Director</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              </CarouselContent>
              <div className="flex justify-center mt-4">
                <CarouselPrevious className="relative inset-0 translate-y-0 -left-4" />
                <CarouselNext className="relative inset-0 translate-y-0 -right-4" />
              </div>
            </Carousel>
          </div>
        </div>
      </section>

      {/* Access Levels Section */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-terracotta mb-6">
            Flexible Access Control
          </h2>
          <p className="text-center text-gray mb-12 max-w-2xl mx-auto">
            Our platform offers three levels of access to ensure the right people have the right permissions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-terracotta">Level 1</h3>
                  <div className="h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-gold" />
                  </div>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-teal mr-2" />
                    <span className="text-gray">View same level records</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-teal mr-2" />
                    <span className="text-gray">Upload personal records</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-teal mr-2" />
                    <span className="text-gray">Update personal records</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-terracotta">Level 2</h3>
                  <div className="h-8 w-8 rounded-full bg-teal/20 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-teal" />
                  </div>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-teal mr-2" />
                    <span className="text-gray">View Level 1 & 2 records</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-teal mr-2" />
                    <span className="text-gray">Upload personal records</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-teal mr-2" />
                    <span className="text-gray">Update Level 1 & personal records</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-terracotta">Level 3</h3>
                  <div className="h-8 w-8 rounded-full bg-terracotta/20 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-terracotta" />
                  </div>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-teal mr-2" />
                    <span className="text-gray">View all records</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-teal mr-2" />
                    <span className="text-gray">Upload records</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-teal mr-2" />
                    <span className="text-gray">Update all records</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-terracotta text-cream">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="max-w-2xl mx-auto mb-8 text-cream/90">
            Join ABC Company today and start managing your virtual conference records more efficiently.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              variant="secondary" 
              size="lg"
              className="bg-cream text-terracotta hover:bg-cream/90"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-cream text-cream hover:bg-cream/10"
              onClick={() => navigate('/contact')}
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
