# Optimize - Performance & Efficiency Improvements

Use this prompt when you need to optimize performance, reduce costs, or improve efficiency.

## Template

**Optimization Target**: [What needs to be optimized]

**Current Performance**: [Current metrics or pain points]

**Optimization Goals**:
- [ ] Reduce page load time
- [ ] Improve database query performance
- [ ] Reduce Supabase usage costs
- [ ] Optimize bundle size
- [ ] Improve mobile performance
- [ ] Reduce memory usage

**Constraints**:
- [Budget limitations]
- [Technical constraints]
- [Compatibility requirements]

**Success Metrics**: [How to measure success]

## Examples

### Database Query Optimization
**Optimization Target**: Product listing page with search and filtering

**Current Performance**:
- Page load time: 2.5 seconds
- Database query time: 800ms
- 50+ products per page
- Search across Arabic and French text

**Optimization Goals**:
- [x] Improve database query performance
- [x] Reduce page load time

**Constraints**:
- Must maintain Arabic/French search capability
- Stay within Supabase free tier limits
- Preserve all existing functionality

**Success Metrics**:
- Page load time < 1 second
- Database query time < 200ms
- No increase in Supabase costs

### Supabase Storage Optimization
**Optimization Target**: Product image storage and delivery

**Current Performance**:
- Average image size: 2MB
- Storage usage: 5GB/month
- CDN costs increasing
- Slow image loading on mobile

**Optimization Goals**:
- [x] Reduce Supabase usage costs
- [x] Improve mobile performance

**Constraints**:
- Maintain image quality for product photos
- Support automatic image optimization
- Backward compatibility with existing images

**Success Metrics**:
- 50% reduction in storage costs
- Image load time < 500ms on 3G
- Maintain visual quality standards

### Bundle Size Optimization
**Optimization Target**: Next.js application bundle size

**Current Performance**:
- Initial bundle: 450KB
- Total JavaScript: 1.2MB
- First Contentful Paint: 1.8s
- Time to Interactive: 3.2s

**Optimization Goals**:
- [x] Optimize bundle size
- [x] Improve mobile performance

**Constraints**:
- Maintain all current features
- Support Arabic RTL layout
- Keep TypeScript and Tailwind CSS

**Success Metrics**:
- Bundle size < 300KB
- FCP < 1 second
- TTI < 2 seconds on mobile