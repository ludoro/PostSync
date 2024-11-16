import React from 'react';
import { Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Plan {
  name: string;
  price: string;
  description: string;
  features: string[];
}

const PlanSelectionOverlay = ({ onSelectPlan }: { onSelectPlan: (plan: Plan) => void }) => {
  const plans: Plan[] = [
    {
      name: 'Starter',
      price: '$9',
      description: 'Perfect for individuals and small teams',
      features: [
        'Up to 10 scheduled posts',
        'Basic analytics',
        'Single social account',
        '24/7 support'
      ]
    },
    {
      name: 'Pro',
      price: '$29',
      description: 'Best for growing businesses',
      features: [
        'Unlimited scheduled posts',
        'Advanced analytics',
        'Up to 5 social accounts',
        'Priority support',
        'Custom scheduling'
      ]
    },
    {
      name: 'Enterprise',
      price: '$99',
      description: 'For large organizations',
      features: [
        'Everything in Pro',
        'Unlimited social accounts',
        'Team collaboration',
        'API access',
        'Custom solutions'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="w-full max-w-6xl p-6">
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          Choose Your Plan
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.name} className="bg-white">
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-6">
                  {plan.price}
                  <span className="text-base font-normal text-gray-600">/month</span>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={() => onSelectPlan(plan)}
                  variant={plan.name === 'Pro' ? 'default' : 'outline'}
                >
                  Select {plan.name}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlanSelectionOverlay;