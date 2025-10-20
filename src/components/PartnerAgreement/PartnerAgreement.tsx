'use client';

import React, { useState, useEffect } from 'react';

interface PartnerAgreementProps {
  userName: string;
  completeAddress: string;
  gstNumber: string;
  pincode: string;
  city: string;
  state: string;
  phoneNumber: string;
  email: string;
  setBlob: (blob: Blob) => void;
}

const PartnerAgreement: React.FC<PartnerAgreementProps> = ({
  userName,
  completeAddress,
  gstNumber,
  pincode,
  city,
  state,
  phoneNumber,
  email,
  setBlob
}) => {
  const [url, setUrl] = useState<string>("");

  const generatePA = async () => {
    const day = new Date();
    const date = day.getDate();
    const month = day.getMonth() + 1; // JavaScript months are 0-indexed
    const year = day.getFullYear();
    
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    const htmlStr = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Glazia Partner Agreement</title>
    <style>
        @page {
            size: A4;
            margin: 2cm;
        }

        body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.5;
            color: #000;
            margin: 0 auto;
            width: 21cm;
            padding: 2cm;
            box-sizing: border-box;
        }

        h1 {
            text-align: center;
            text-decoration: underline;
            font-size: 16pt;
            margin-bottom: 24pt;
        }

        .section {
            margin-bottom: 14pt;
        }

        .indent {
            margin-left: 2em;
        }

        b {
            font-weight: bold;
        }
    </style>
</head>

<body>

    <h1>AGREEMENT</h1>

    <div class="section">
        This agreement is made at <b>${state}</b> on this <b>${date}</b> day of <b>${monthNames[month - 1]}, ${year}</b> ("Agreement").
    </div>

    <div class="section">
        <b>BY AND BETWEEN</b><br>
        <div class="indent">
            Glazia Windoors Private Limited is a Firm incorporated under the laws of the Companies Act 2013 and having
            its registered/principal office at Kevat Khata No 361, Rect, No 21, Killa No 4/7 0-18, Kherki Daula Village
            Road, Gurugram, India through Mr. Navdeep Kamboj, (hereinafter referred to as the "Supplier") of the ONE
            PART;
        </div>
    </div>

    <div class="section">
        <b>AND</b><br>
        <div class="indent">
            ${userName}<br>
            ${email}<br>
            GST No: ${gstNumber}<br>
            ${completeAddress}, ${city} - ${pincode}, ${state}, India<br>
            (hereinafter referred to as the "Fabricator/Dealer") of the OTHER PART.
        </div>
    </div>

    <div class="section">
        (Supplier and Fabricator/Dealer are collectively referred to as "Parties" and individually as "Party")
    </div>

    <div class="section">
        <b>WHEREAS:</b>
        <div class="indent">
            <p>
                A. GLAZIA WINDOORS PRIVATE LIMITED is engaged inter alia in the business of architectural Aluminium
                systems products for marketing & supplying extrusions, gaskets, accessories like screws, plastic
                components, etc., and hardware like hinges, handles, tooling, and other high-end luxury products.
            </p>
            <p>
                B. Fabricator/Dealer is engaged inter alia in the business of supplying fabricated Aluminum Façade,
                Doors, Windows & Internal partition Systems.
            </p>
            <p>
                C. GLAZIA WINDOORS PRIVATE LIMITED on the request of the Fabricator/Dealer is agreeable to explore
                business opportunities of mutual benefits initially for the region <b>${state}</b> with the
                Fabricator/Dealer in relation to supplying Aluminium fabricated Windows, doors, and façade systems of
                Glazia Windoors listed in Annexure I attached, from the Fabricator/Dealer (the "Purpose") and for the
                Purpose it may be desirable or necessary for GLAZIA WINDOORS PRIVATE LIMITED to disclose to the
                Fabricator/Dealer the Confidential Information (as defined in Article 1.3 hereof) which is either
                non-public, confidential or proprietary in nature and which may be disclosed either in written,
                electronic, oral or any other form/medium of whatsoever nature.
            </p>
            <p>
                D. Fabricator/Dealer is authorized to consult, evaluate, and execute projects & retail site,
                establish/negotiate for development of the business to supply to the developers/builders/showroom under
                the jurisdiction of his region.
            </p>
            <p>
                E. GLAZIA WINDOORS PRIVATE LIMITED being desirous of controlling the dissemination of the Confidential
                Information wishes the Fabricator/Dealer to enter into this Agreement and the Fabricator/Dealer has
                agreed to enter into this Agreement with GLAZIA WINDOORS PRIVATE LIMITED in respect of the Confidential
                Information and agrees and acknowledges that the Confidential Information will be regarded as
                confidential or proprietary in nature and will not be disclosed or used except in accordance with this
                Agreement.
            </p>
        </div>
    </div>

    <div class="section">
        NOW THEREFORE, This Agreement witnessed and in consideration of the mutually promised and covenants contained
        herein and for good and valuable mutual consideration, the receipt and sufficiency of which is hereby
        acknowledged, the Parties hereby agree as follows:
    </div>

    <div class="section">
        <b>1. DEFINITIONS</b>
        <div class="indent">
            <p>Unless the context otherwise requires, when used in this Agreement the following terms have the following
                meanings:</p>

            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <tr>
                    <td style="width: 8%; vertical-align: top;"><b>1.1</b></td>
                    <td style="width: 35%; vertical-align: top;"><b>"Agreement"</b></td>
                    <td style="width: 57%; vertical-align: top;">
                        Shall mean this Agreement and shall include any subsequent written additions, modifications, and
                        amendments thereto.
                    </td>
                </tr>
                <tr>
                    <td style="vertical-align: top;"><b>1.2</b></td>
                    <td style="vertical-align: top;"><b>"GLAZIA WINDOORS PRIVATE LIMITED"</b></td>
                    <td style="vertical-align: top;">
                        Shall mean GLAZIA WINDOORS PRIVATE LIMITED, Kevat Khata No 361, Rect, No 21, Killa No 4/7 0-18,
                        Kherki Daula Village Road, Gurugram.
                    </td>
                </tr>
                <tr>
                    <td style="vertical-align: top;"><b>1.3</b></td>
                    <td style="vertical-align: top;"><b>"Confidential Information"</b></td>
                    <td style="vertical-align: top;">
                        Shall include but not be restricted to all documents, materials, memoranda, copies, reports,
                        papers,
                        surveys, data,
                        graphs, charts, analyses, summaries, designs, drawings, diagrams, discs, tapes, floppy disks,
                        CDs,
                        DVDs, and other
                        information, of whatever nature and in whichever form, pertaining/relating to/owned or used by
                        GLAZIA WINDOORS
                        PRIVATE LIMITED (whether in physical/visual/oral/electronic/written and/or any other tangible
                        form
                        or otherwise)
                        and disclosed to the Fabricator/Dealer (whether prior to or after the execution of this
                        Agreement),
                        including without
                        limitations:
                        <ul style="list-style-type: none; padding-left: 0; margin-top: 0.5em;">
                            <li style="margin-bottom: 1em;">
                                ❖ any know-how, patent, copyright, software program, procedure, methodology, systems,
                                applications, computer files/data,
                                techniques, scientific data, price specifications, information pertaining to the
                                training
                                procedures/manuals, trade secrets,
                                business methods, business process, business techniques, customers list, price lists,
                                marketing plans, business plans,
                                drawings, designs, samples, past data concepts and ideas and other know-how, whether
                                protected under law or not, products
                                and product lines and other information relevant to GLAZIA WINDOORS PRIVATE LIMITED's
                                business including but not limited
                                to technical information (and any tangible expression of such technical information),
                                commercial information and financial
                                information and past, present and future plans of GLAZIA WINDOORS PRIVATE LIMITED; and
                            </li>
                            <li>
                                ❖ any other matter which may reasonably be regarded as confidential or proprietary as
                                per
                                industry practice or which the
                                GLAZIA WINDOORS PRIVATE LIMITED informs the Fabricator/Dealer that it considers as
                                confidential or proprietary.
                            </li>
                        </ul>
                    </td>
                </tr>
                <tr>
                    <td style="vertical-align: top;"><b>1.4</b></td>
                    <td style="vertical-align: top;"><b>"Purpose"</b></td>
                    <td style="vertical-align: top;">
                        Shall have the meaning ascribed to it in Recital C hereof.
                    </td>
                </tr>
            </table>
        </div>

        <div class="section">
            <b>3. CONFIDENTIALITY OBLIGATIONS</b>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <tr>
                    <td style="width: 6%; vertical-align: top;"><b>3.1</b></td>
                    <td style="width: 94%; vertical-align: top;">
                        The Fabricator/Dealer hereby represents, warrants, and undertakes that it will not without the
                        specific prior written consent
                        of GLAZIA WINDOORS PRIVATE LIMITED, disclose the Confidential Information or any part thereof to
                        any
                        third party.
                        The Fabricator/Dealer acknowledges that the Confidential Information received by it on and from
                        ${date}
                        day of ${monthNames[month - 1]}
                        shall be covered and governed by this Agreement as if disclosed pursuant to this Agreement.
                    </td>
                </tr>
                <tr>
                    <td style="vertical-align: top;"><b>3.2</b></td>
                    <td style="vertical-align: top;">
                        The Fabricator/Dealer hereby represents, warrants, and undertakes that it will keep secret and
                        confidential
                        the Confidential Information and all other information that comes into its knowledge or is
                        generated
                        or
                        collected by it for the Purpose and will not use the same for any purpose whatsoever other than
                        for
                        the
                        Purpose in strict accordance with the terms and conditions of this Agreement.
                    </td>
                </tr>
            </table>
        </div>

        <div class="section">
            <b>8. TERM OF AGREEMENT</b>
            <div class="indent">
                <p>
                    This Agreement shall be deemed to be effective from ${date}/${month}/${year} being the date of first disclosure
                    of Confidential
                    Information by GLAZIA WINDOORS PRIVATE LIMITED to the Fabricator/Dealer. The license should be
                    renewed first on
                    completion of 3 years and subsequent renewal will be in each 5th year.
                </p>
            </div>
        </div>

        <div class="section">
            <b>13. NOTICE</b>
            <div class="indent">
                <p><b>13.1</b> Any notice, demand, consent, or other communication given or made under this Agreement:
                </p>
                <ol type="a" style="margin-left: 1.5em;">
                    <li>must be in writing and signed by a person duly authorized by the sender; and</li>
                    <li>
                        must be delivered to the intended Fabricator/Dealer by prepaid post or by hand or email to the
                        address
                        or email addresses below or the address last notified by the intended Fabricator/Dealer to the
                        sender:
                        <br><br>
                        <b>To GLAZIA WINDOORS PRIVATE LIMITED</b><br>
                        Attention: Director<br>
                        Address: GLAZIA WINDOORS PRIVATE LIMITED,<br>
                        Kevat Khata No 361, Rect, No 21, Killa No 4/7 0-18<br>
                        Kherki Daula Village Road, Gurugram, India<br>
                        Phone: +91 9354876670, 9958053708; Email: sales@glazia.in<br><br>

                        <b>To The Fabricator/Dealer</b><br>
                        Attention: Mr./Ms. ${userName}<br>
                        Address: ${completeAddress}<br>
                        Phone: +91 ${phoneNumber}; Email: ${email}
                    </li>
                </ol>
            </div>
        </div>

        <div class="section">
            <p>
                <b>IN WITNESS WHEREOF,</b> the Parties have caused this Agreement to be executed by and through their
                duly
                authorized
                representatives as of the date first above written.
            </p>
        </div>

        <div class="section" style="margin-top: 2em;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="width: 50%; vertical-align: top;">
                        <b>GLAZIA WINDOORS PRIVATE LIMITED</b><br><br>
                        By<br><br>
                    </td>
                    <td style="width: 50%; vertical-align: top;">
                        <b>(Fabricator/Dealer)</b><br><br>
                        By<br><br>
                    </td>
                </tr>
                <tr>
                    <td style="vertical-align: top;">
                        Name: _________________________________<br>
                        Title: <b>DIRECTOR</b><br><br>
                        Witness:<br>
                        Name: ____________________________<br>
                        Address: ______________________________
                    </td>
                    <td style="vertical-align: top;">
                        Name: _________________________________<br>
                        Title: __________________________________<br><br>
                        Witness:<br>
                        Name: _________________________________<br>
                        Address: ______________________________
                    </td>
                </tr>
            </table>
        </div>

        <div class="section" style="margin-top: 5em;">
            <p style="text-align: center; text-decoration: underline; font-weight: bold;">Details of Systems</p>
            <ul style="margin-left: 2em;">
                <li><b>C-Series</b> (Sliding System)</li>
                <li><b>E-series</b> (Sliding System)</li>
                <li><b>P-Series</b> (Sliding System)</li>
                <li><b>C4</b> (Casement System)</li>
                <li><b>C5</b> (Casement System)</li>
                <li><b>E131</b> (Casement System)</li>
                <li><b>E231</b> (Casement System)</li>
                <li><b>ESF</b> (Slide & Fold)</li>
                <li><b>PSF</b> (Slide & Fold)</li>
                <li><b>Railing</b></li>
                <li><b>C1645</b> (Internal Partition)</li>
            </ul>
        </div>
    </div>
</body>

</html>`;

    try {
      // Dynamically import html2pdf to avoid SSR issues
      const html2pdf = (await import('html2pdf.js')).default;
      
      const opt = {
        margin: 0.5,
        filename: 'document.pdf',
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in' as const, format: 'letter' as const, orientation: 'portrait' as const }
      };

      const pdfBlob = await html2pdf().set(opt).from(htmlStr).outputPdf('blob');
      setBlob(pdfBlob);
      setUrl(URL.createObjectURL(pdfBlob));
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  useEffect(() => {
    generatePA();
  }, []);

  return (
    <div className="mt-4">
      {url ? (
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Open Partner Agreement
        </a>
      ) : (
        <div className="text-gray-600">Generating partner agreement...</div>
      )}
    </div>
  );
};

export default PartnerAgreement;
