import { CommunityChallenge, User } from '@prisma/client';

export type ChallengeRewardEmailProps = {
  communityChallenge: CommunityChallenge;
  receiver: User;
};
export default function generateChallengeRewardEmailTemplte(props: ChallengeRewardEmailProps) {
    const { communityChallenge, receiver } = props;
  return `
    <!DOCTYPE html>
<html>
<head>
  <style>
    .bg-white { background-color: white; }
    .font-sans { font-family: sans-serif; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .w-full { width: 100%; }
    .max-w-660px { max-width: 660px; }
    .p-5 { padding: 1.25rem; }
    .text-right { text-align: right; }
    .align-middle { vertical-align: middle; }
    .text-2xl { font-size: 1.5rem; }
    .font-light { font-weight: 300; }
    .text-gray-600 { color: #4A5568; }
    .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }
    .text-center { text-align: center; }
    .text-base { font-size: 1rem; }
    .font-medium { font-weight: 500; }
    .text-lg { font-size: 1.125rem; }
    .rounded-md { border-radius: 0.375rem; }
    .bg-gray-100 { background-color: #F7FAFC; }
    .text-sm { font-size: 0.875rem; }
    .h-12 { height: 3rem; }
    .border-b { border-bottom-width: 1px; }
    .border-r { border-right-width: 1px; }
    .border-solid { border-style: solid; }
    .border-white { border-color: white; }
    .pl-5 { padding-left: 1.25rem; }
    .m-0 { margin: 0; }
    .p-0 { padding: 0; }
    .text-xs { font-size: 0.75rem; }
    .text-blue-600 { color: #3182CE; }
    .underline { text-decoration: underline; }
    .pt-3 { padding-top: 0.75rem; }
    .align-top { vertical-align: top; }
    .my-7 { margin-top: 1.75rem; margin-bottom: 1.75rem; }
    .ml-5 { margin-left: 1.25rem; }
    .rounded-xl { border-radius: 0.75rem; }
    .border { border-width: 1px; }
    .border-gray-400 { border-color: #CBD5E0; }
    .font-semibold { font-weight: 600; }
    .no-underline { text-decoration: none; }
    .mx-1 { margin-left: 0.25rem; margin-right: 0.25rem; }
    .font-light { font-weight: 300; }
  </style>
</head>
<body class="bg-white font-sans">
  <div class="mx-auto w-full max-w-660px p-5">
    <div>
      <div class="text-right align-middle">
        <p class="text-2xl font-light text-gray-600">Reward</p>
      </div>
    </div>
    <div class="space-y-4 text-center text-base font-medium">
      <p class="text-lg">Congratulations!</p>
      <p>You've completed the challenge of ${communityChallenge.title}!</p>
      <p>This is your reward!</p>
    </div>
    <div class="rounded-md bg-gray-100 text-sm">
      <div class="h-12">
        <div>
          <div>
            <div class="h-11 border-b border-r border-solid border-white pl-5">
              <p class="m-0 p-0 text-xs text-gray-600">CHALLENGE ID:</p>
              <a class="m-0 p-0 text-xs text-blue-600 underline">${communityChallenge.id}</a>
            </div>
          </div>
          <div>
            <div class="h-11 border-b border-r border-solid border-white pl-5">
              <p class="m-0 p-0 text-xs text-gray-600">ORDER ID</p>
              <a class="m-0 p-0 text-xs text-blue-600 underline">ML4F5L8522</a>
            </div>
            <div class="h-11 border-b border-r border-solid border-white pl-5">
              <p class="m-0 p-0 text-xs text-gray-600">DOCUMENT NO.</p>
              <p class="m-0 p-0 text-xs">186623754793</p>
            </div>
          </div>
        </div>
      </div>
      <div class="h-11 border-b border-r border-solid border-white pl-5 pt-3 align-top">
        <p class="m-0 p-0 text-xs text-gray-600">SENT TO ACCOUNT:</p>
        <p class="m-0 p-0 text-xs">${receiver.fullName}</p>
        <p class="m-0 p-0 text-xs">${receiver.email}</p>
      </div>
    </div>
    <div class="my-7 h-6 rounded-md bg-gray-100 text-sm">
      <p class="m-0 bg-gray-100 px-2 text-sm font-medium">${communityChallenge.reward}</p>
    </div>
    <div>
      <div class="w-16">
        <img src="" width="64" height="64" alt="Reward Image" class="ml-5 rounded-xl border border-gray-400" />
      </div>
      <div class="pl-5">
        <p class="m-0 p-0 text-xs font-semibold"></p>
        <p class="m-0 p-0 text-xs text-gray-600">HBO Max Ad-Free (Monthly)</p>
        <p class="m-0 p-0 text-xs text-gray-600">Renews Aug 20, 2023</p>
        <a href="https://userpub.itunes.apple.com/WebObjects/MZUserPublishing.woa/wa/addUserReview?cc=us&id=1497977514&o=i&type=Subscription%20Renewal" class="text-xs text-blue-600 no-underline">Write a Review</a>
        <span class="mx-1 font-light text-gray-600">|</span>
        <a href="https://buy.itunes.apple.com/WebObjects/MZFinance.woa/wa/reportAProblem?a=1497977514&cc=us&d=683263808&o=i&p=29065684906671&pli=29092219632071&s=1" class="text-xs text-blue-600 no-underline">Report a Problem</a>
      </div>
    </div>
    <hr class="border-gray-300" />
    <div>
      <p class="m-0 p-0 text-xs text-gray-600">1. The movie ticket reward is valid for one-time use only and must be redeemed by the expiry date mentioned above.</p>
      <p class="m-0 p-0 text-xs text-gray-600">2. The reward is non-transferable and cannot be exchanged for cash or any other goods or services.</p>
      <p class="m-0 p-0 text-xs text-gray-600">3. The movie ticket reward can only be redeemed at participating cinemas. Please check with your local cinema for availability.</p>
      <p class="m-0 p-0 text-xs text-gray-600">4. The reward is subject to seat availability and may not be valid for special screenings or events.</p>
      <p class="m-0 p-0 text-xs text-gray-600">5. Lost or stolen movie ticket rewards will not be replaced.</p>
      <p class="m-0 p-0 text-xs text-gray-600">6. The issuer reserves the right to amend these terms and conditions at any time without prior notice.</p>
      <p class="m-0 p-0 text-xs text-gray-600">7. By redeeming the movie ticket reward, you agree to these terms and conditions.</p>
    </div>
    <hr class="border-gray-300" />
    <div class="text-center">
      <a href="https://www.apple.com/legal/internet-services/itunes/us/terms.html" class="text-xs text-gray-600 no-underline">Terms of Sale</a>
      <span class="mx-2">|</span>
      <a href="https://www.apple.com/legal/privacy/en-ww/" class="text-xs text-gray-600 no-underline">Apple Privacy Policy</a>
    </div>
  </div>
</body>
</html>
    `;
}
