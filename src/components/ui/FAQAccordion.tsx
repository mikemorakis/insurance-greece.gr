import { useState } from 'react';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs: FAQ[];
}

export default function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-accordion">
      {faqs.map((faq, index) => (
        <div key={index} className="faq-item" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
          <h3 className="faq-heading">
            <button
              className="faq-question"
              onClick={() => toggle(index)}
              aria-expanded={openIndex === index}
              aria-controls={`faq-answer-${index}`}
            >
              <span itemProp="name">{faq.question}</span>
              <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </h3>
          {openIndex === index && (
            <div id={`faq-answer-${index}`} className="faq-answer" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
              <div itemProp="text" dangerouslySetInnerHTML={{ __html: faq.answer }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
