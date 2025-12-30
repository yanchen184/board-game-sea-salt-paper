## FEATURE:

- Online multiplayer card game "Sea Salt & Paper" built with React + Vite + Firebase
- Support 2-4 real players with real-time synchronization via Firebase Realtime Database
- AI opponents with 3 difficulty levels (easy, medium, hard)
- Complete game mechanics: card drawing, pairing effects, scoring, round declaration
- Customizable game rules (target score, starting hand, special win conditions)
- Game history tracking and leaderboard system
- Modern Board Game Arena (BGA) style UI with drag & drop interactions
- Responsive design for desktop, tablet, and mobile devices

## EXAMPLES:

**Reference the existing project** in `D:\frontend\sea-salt-paper\` for:

- **Design specifications**: See `DESIGN_SPEC.md`, `FRONTEND_SPEC.md`, `FIREBASE_SPEC.md` for detailed UI/UX guidelines, component specifications, and backend architecture
- **Card data structure**: Review `src/data/cards.js` for the 72-card game definition
- **Game rules**: Check `src/data/gameRules.js` for scoring logic and win conditions
- **Firebase integration patterns**: Examine `src/services/gameService.js` and `src/config/firebase.js`
- **Component structure**: Look at `src/components/` for component organization patterns

**Key differences from old project**:
- The new project will follow strict architectural patterns from `PLANNING.md`
- Better separation of concerns (components, services, utils, hooks)
- Comprehensive unit testing with Vitest
- Improved state management and real-time sync handling
- Enhanced AI decision-making algorithms
- All files kept under 500 lines of code

## DOCUMENTATION:

### Official Documentation
- React 18: https://react.dev/
- Vite: https://vitejs.dev/
- Firebase Realtime Database: https://firebase.google.com/docs/database
- Firebase Hosting: https://firebase.google.com/docs/hosting
- Vitest (Testing): https://vitest.dev/

### Game Rules
- Physical game rulebook: https://cdn.1j1ju.com/medias/a5/4b/bb-sea-salt-paper-rulebook.pdf
- Board Game Arena implementation: https://en.boardgamearena.com/gamepanel?game=seasaltpaper
- Game rules summary in `README.md` (existing project)

### Project Documentation
- **PLANNING.md**: Complete architecture, data models, development phases
- **TASK.md**: Detailed task breakdown and progress tracking
- **DATABASE_DESIGN.md**: Firebase database schema, security rules, optimization
- **DESIGN_SPEC.md**: UI/UX design system, color palette, component specs
- **FRONTEND_SPEC.md**: React implementation details, hooks, state management
- **FIREBASE_SPEC.md**: Backend specifications, real-time sync patterns

## OTHER CONSIDERATIONS:

### Development Environment
- Node.js 18+ required
- Firebase project must be created and configured
- `.env.local` file needed for Firebase credentials (see `.env.example`)
- Use `npm run dev` for development server
- Use `npm run build` for production build

### Code Standards
- **File size limit**: Maximum 500 lines per file
- **Component structure**: Each component in its own folder with `.jsx` and `.css`
- **CSS methodology**: BEM naming convention
- **Testing**: Vitest for unit tests, 80%+ coverage target
- **Comments**: JSDoc for all functions, inline comments for complex logic
- **Git commits**: Follow conventional commits format

### Custom Game Mechanic Changes

**⚠️ IMPORTANT**: This implementation modifies the standard game rules:

1. **Draw Mechanism - Two-Card Choice**:
   - When drawing from the deck, player draws **2 cards** instead of 1
   - Player must choose **1 card to keep** and add to hand
   - The other card must be **discarded to either the left or right discard pile**
   - This choice is **visible to all players** via action log
   - Implementation: `CardChoiceModal` component with drag/drop interface

2. **Card Selection Validation**:
   - Players **cannot select invalid pairs**
   - When one card is selected, only valid pairing cards are clickable
   - Invalid cards are visually disabled (grayed out)
   - Prevents frustration from attempting invalid pair plays

3. **Card Display - No Overlapping**:
   - Hand cards are displayed **side-by-side with spacing**
   - Cards do not overlap (unlike traditional fan layout)
   - Better visibility on all screen sizes
   - Slight rotation (3deg) for visual interest only

### Common Pitfalls to Avoid
1. **Don't expose hand cards**: Players should only see their own hand, others see card count only
2. **Validate game rules strictly**:
   - Empty discard pile must receive discarded card first
   - Score must be >= 7 to declare
   - Shark + Swimmer is a valid pair (special case)
3. **Two-card draw validation**:
   - Deck must have at least 2 cards before drawing
   - Handle edge case when deck has only 1 card (needs reshuffle first)
   - Ensure `turnPhase: 'choosing_card'` is properly handled
4. **Handle real-time sync carefully**:
   - Use Firebase transactions for atomic updates (especially turn changes)
   - Implement optimistic UI updates with rollback on conflict
   - Clean up Firebase listeners on component unmount
5. **AI turn timing**: Add 1-2 second delays to make AI feel natural
6. **Mobile responsiveness**: Test card choice modal on touch devices
7. **Firebase security**: Follow security rules in `DATABASE_DESIGN.md`
8. **Score calculation**: Mermaid scoring is complex (1st mermaid = most common color count, 2nd = second most)
9. **Color bonus**: Only applied at round end, counts cards of most common color

### Firebase Specific Gotchas
- Always use `.on()` for real-time listeners, `.once()` for one-time reads
- Unsubscribe all listeners with `.off()` when component unmounts
- Use `serverTimestamp()` for consistent timestamps across clients
- Handle offline/online state changes
- Limit array sizes (action log max 20 entries)
- Clean up old rooms (implement automatic deletion after 24 hours)

### Game Logic Edge Cases
1. **Deck runs out**: Reshuffle discard piles if deck is empty
2. **Last chance with tie**: If multiple players tie with declarer, declarer loses
3. **4 Mermaids**: Instant win, ignore current scores
4. **Sailboat pair**: Can trigger multiple extra turns (pair sailboats again)
5. **Stealing from empty hand**: If target has no cards, steal action fails silently
6. **Color bonus with multi-color mermaids**: Mermaids don't count toward color bonus

### Performance Optimization
- Lazy load game board component (use React.lazy)
- Memoize expensive calculations (card sorting, score calculation)
- Debounce rapid Firebase writes
- Use CSS transforms for animations (better performance than position changes)
- Minimize re-renders with React.memo and useMemo

### Testing Priorities
1. Score calculation (all scenarios: base, pairs, multipliers, mermaids, color)
2. Pair validation (including Shark + Swimmer special case)
3. Win condition checks
4. Deck shuffle and dealing
5. Firebase service methods (mock Firebase in tests)
6. AI decision-making logic

### Deployment Checklist
- Set Firebase security rules
- Configure Firebase indexes
- Enable Firebase offline persistence
- Set up environment variables for production
- Test on multiple browsers (Chrome, Firefox, Safari)
- Test on mobile devices (iOS Safari, Android Chrome)
- Verify HTTPS is enabled
- Check bundle size (aim for < 500KB)

### Future Enhancements (Not MVP)
- User authentication (Firebase Auth)
- Private rooms with passwords
- Spectator mode
- Game replays
- Sound effects and background music
- Achievements and badges
- Tournament mode
- Internationalization (i18n)
