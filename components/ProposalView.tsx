
import React from 'react';

const ProposalView: React.FC = () => {
  return (
    <div className="bg-white p-12 rounded-xl shadow-lg border border-gray-200 max-w-4xl mx-auto font-serif text-gray-900">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold uppercase tracking-tight">Project D.I.R.E.C.T.</h1>
        <p className="text-sm text-gray-500 italic mt-2">(Departmental Integrated Records, Evaluation, and Comprehensive Tracking System)</p>
        <div className="w-24 h-1 bg-indigo-900 mx-auto mt-6"></div>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-bold border-b-2 border-gray-100 pb-2 mb-4">I. Rationale</h2>
        <p className="leading-relaxed text-justify">
          The manual management of departmental records, teacher profiles, and laboratory inventory in the current educational setup is prone to data redundancy, physical damage, and slow retrieval. Transitioning to Project D.I.R.E.C.T. ensures that high-stakes data—such as student Item Analysis and teacher qualification records—are centralized, secure, and instantly accessible. This digital shift optimizes administrative efficiency and promotes data-driven decision-making within the department.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold border-b-2 border-gray-100 pb-2 mb-4">II. SMART Objectives</h2>
        <ul className="list-disc pl-6 space-y-3">
          <li><strong>Efficiency:</strong> Reduce the retrieval time of teacher files and laboratory records by 90% through a centralized digital search system within the first month of deployment.</li>
          <li><strong>Accountability:</strong> Achieve 100% real-time tracking of borrowed laboratory tools and equipment, reducing loss rates to zero by the end of the academic year.</li>
          <li><strong>Performance:</strong> Increase the accuracy of mastery-level interventions by generating automated graphical item analysis reports within 24 hours of examination completion.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold border-b-2 border-gray-100 pb-2 mb-4">III. Expected Outcomes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-bold text-indigo-900 text-sm mb-2 uppercase">Teacher Productivity</h4>
            <p className="text-xs text-gray-600">Reduced clerical load allowing more focus on instruction and curriculum development.</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-bold text-indigo-900 text-sm mb-2 uppercase">Data Analysis</h4>
            <p className="text-xs text-gray-600">Automated mastery charts provide immediate insights into student learning gaps.</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-bold text-indigo-900 text-sm mb-2 uppercase">Accountability</h4>
            <p className="text-xs text-gray-600">Strict tracking of consumables and equipment longevity via digital borrowing logs.</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold border-b-2 border-gray-100 pb-2 mb-4">IV. Sustainability Plan</h2>
        <p className="leading-relaxed text-justify">
          Project D.I.R.E.C.T. is built on a scalable architecture (Vercel & Neon Postgres) with minimal overhead. The department will appoint a "System Coordinator" for quarterly database audits. Training sessions will be integrated into regular In-Service Training (INSET) to ensure all staff are proficient in system navigation.
        </p>
      </section>

      <div className="mt-16 flex justify-between border-t border-gray-200 pt-8 italic text-sm text-gray-500">
        <div>Prepared by: Senior Innovation Consultant</div>
        <div>Date: May 2024</div>
      </div>
    </div>
  );
};

export default ProposalView;
