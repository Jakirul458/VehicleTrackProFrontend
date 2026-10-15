import { Shield, Users, Zap, Lock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function AboutPage() {
  const targetAudience = [
    "Insurance agents managing policy renewals",
    "Cyber cafés providing vehicle documentation services",
    "Vehicle service centers tracking compliance",
    "Document service providers",
    "Small vehicle management businesses",
    "Fleet operators managing multiple vehicles"
  ];

  return (
    <div className="min-h-screen py-20 px-4 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto max-w-4xl">
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-primary to-purple-600">
            About VehicleTrack Pro
          </h1>
          <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full" />
        </motion.div>
        
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeInUp}
          className="mb-16 bg-card p-8 rounded-2xl shadow-sm border border-border/50"
        >
          <h2 className="text-2xl font-semibold mb-4 text-foreground">What We Do</h2>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            VehicleTrack Pro is a document tracking system designed for insurance agents, cyber cafés, and document
            service providers. It keeps insurance policies, road tax, and PUC records with their expiry dates in one place.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Never miss a document expiry date again with our intelligent tracking and alert system. 
            Record the customer and vehicle details needed for each document, without maintaining separate customer or vehicle profiles.
          </p>
        </motion.section>

        <section className="mb-16">
          <motion.h2 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-2xl font-semibold mb-8 text-center"
          >
            Key Features
          </motion.h2>
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid md:grid-cols-2 gap-6"
          >
            {[
              { icon: Shield, title: "Document Tracking", desc: "Track insurance, road tax, and PUC with expiry monitoring.", color: "text-blue-500", bg: "bg-blue-500/10" },
              { icon: Users, title: "Agent-managed Access", desc: "Super Admins create and manage agent accounts.", color: "text-purple-500", bg: "bg-purple-500/10" },
              { icon: Zap, title: "Expiry Alerts", desc: "Get notified before documents expire to ensure timely renewals.", color: "text-amber-500", bg: "bg-amber-500/10" },
              { icon: Lock, title: "Secure & Private", desc: "Enterprise-grade security with role-based access control.", color: "text-emerald-500", bg: "bg-emerald-500/10" }
            ].map((feature, idx) => (
              <motion.div key={idx} variants={fadeInUp} className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${feature.bg}`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-2xl font-semibold mb-6">Who It's For</h2>
              <ul className="space-y-4">
                {targetAudience.map((item, idx) => (
                  <motion.li 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3 text-muted-foreground"
                  >
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {[
                { title: "Save Time", desc: "Automate document tracking and reduce paperwork." },
                { title: "Reduce Errors", desc: "Eliminate manual record-keeping mistakes." },
                { title: "Stay Compliant", desc: "Never miss a renewal deadline with alerts." },
                { title: "Better Service", desc: "Provide faster, accurate service." }
              ].map((benefit, idx) => (
                <motion.div 
                  key={idx} 
                  variants={fadeInUp}
                  className="p-5 border border-border/50 rounded-xl bg-card hover:shadow-md hover:border-primary/30 transition-all duration-300"
                >
                  <h3 className="font-semibold mb-2 text-primary">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="bg-gradient-to-br from-primary/5 to-purple-500/5 p-8 rounded-2xl border border-primary/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <Lock className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Enterprise Security</h2>
          </div>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            VehicleTrack Pro takes data security seriously. All data is encrypted in transit and at rest. 
            We use industry-standard authentication and authorization mechanisms to ensure your data 
            remains private and secure.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Role-based access control ensures that agents can only access their own customer and vehicle data, 
            while super admins have platform-wide visibility for management purposes.
          </p>
        </motion.section>
      </div>
    </div>
  );
}