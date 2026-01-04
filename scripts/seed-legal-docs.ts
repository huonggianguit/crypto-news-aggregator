// scripts/seed-legal-docs.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleDocuments = [
  {
    title: 'Nghị định 80/2021/NĐ-CP: Quy định xử phạt hành chính trong lĩnh vực tiền tệ và ngân hàng',
    lawNumber: '80/2021/NĐ-CP',
    issuingAgency: 'Chính phủ',
    promulgationDate: new Date('2021-09-01'),
    effectiveDate: new Date('2021-10-20'),
    summary: 'Nghị định quy định chi tiết về xử phạt hành chính đối với các vi phạm trong lĩnh vực tiền tệ, ngân hàng, bao gồm cả các giao dịch liên quan đến tài sản số và tiền điện tử.',
    content: 'Nghị định 80/2021/NĐ-CP quy định xử phạt vi phạm hành chính trong lĩnh vực tiền tệ và ngân hàng. Các quy định liên quan đến tiền điện tử: Phạt tiền từ 150-200 triệu đồng đối với hành vi cung cấp dịch vụ thanh toán trái phép. Phạt tiền từ 50-100 triệu đồng đối với hành vi sử dụng phương tiện thanh toán trái phép.'
  },
  {
    title: 'Quyết định 942/QĐ-TTg: Phê duyệt Chiến lược phát triển Chính phủ điện tử hướng tới Chính phủ số giai đoạn 2021-2025, định hướng đến năm 2030',
    lawNumber: '942/QĐ-TTg',
    issuingAgency: 'Thủ tướng Chính phủ',
    promulgationDate: new Date('2021-06-15'),
    effectiveDate: new Date('2021-06-15'),
    summary: 'Quyết định phê duyệt chiến lược phát triển Chính phủ điện tử với việc ứng dụng công nghệ blockchain trong quản lý nhà nước.',
    content: 'Quyết định 942/QĐ-TTg phê duyệt chiến lược phát triển Chính phủ điện tử. Mục tiêu đến 2025: Triển khai thí điểm blockchain trong một số lĩnh vực. Thúc đẩy chuyển đổi số trong cơ quan nhà nước. Ứng dụng AI, blockchain, big data vào quản lý.'
  },
  {
    title: 'Chỉ thị 01/CT-NHNN: Tăng cường công tác quản lý hoạt động tiền ảo',
    lawNumber: '01/CT-NHNN',
    issuingAgency: 'Ngân hàng Nhà nước Việt Nam',
    promulgationDate: new Date('2021-04-13'),
    effectiveDate: new Date('2021-04-13'),
    summary: 'Chỉ thị yêu cầu các tổ chức tín dụng không được thực hiện các giao dịch liên quan đến tiền ảo, tiền điện tử.',
    content: 'Chỉ thị 01/CT-NHNN về tăng cường quản lý hoạt động tiền ảo. Nội dung chính: Các tổ chức tín dụng không được thực hiện, tham gia cung ứng dịch vụ liên quan đến tiền ảo. Không cho phép thanh toán bằng Bitcoin và các loại tiền ảo khác. Tăng cường giám sát và xử lý vi phạm.'
  },
  {
    title: 'Luật Giao dịch điện tử 2023',
    lawNumber: '20/2023/QH15',
    issuingAgency: 'Quốc hội',
    promulgationDate: new Date('2023-06-22'),
    effectiveDate: new Date('2024-07-01'),
    summary: 'Luật quy định về giao dịch điện tử trong hoạt động dân sự, hành chính và kinh doanh, bao gồm các quy định về chữ ký số, hợp đồng điện tử và blockchain.',
    content: 'Luật Giao dịch điện tử 2023 có hiệu lực từ 01/07/2024. Các điểm mới: Công nhận giá trị pháp lý của smart contract. Quy định về chứng thực blockchain. Chữ ký số có giá trị như chữ ký tay. Hợp đồng điện tử có giá trị pháp lý tương đương hợp đồng giấy.'
  },
  {
    title: 'Nghị định 53/2022/NĐ-CP: Quy định về bảo vệ dữ liệu cá nhân',
    lawNumber: '53/2022/NĐ-CP',
    issuingAgency: 'Chính phủ',
    promulgationDate: new Date('2022-08-15'),
    effectiveDate: new Date('2023-07-01'),
    summary: 'Nghị định quy định chi tiết về bảo vệ dữ liệu cá nhân trong môi trường số, áp dụng cho các nền tảng blockchain và fintech.',
    content: 'Nghị định 53/2022/NĐ-CP về bảo vệ dữ liệu cá nhân. Các quy định quan trọng: Người xử lý dữ liệu phải có sự đồng ý của chủ thể. Quyền truy cập, sửa đổi, xóa dữ liệu cá nhân. Yêu cầu bảo mật dữ liệu trong công nghệ blockchain. Phạt từ 50-100 triệu đồng nếu vi phạm.'
  },
  {
    title: 'Thông tư 23/2014/TT-NHNN: Cấm phát hành, cung ứng, sử dụng Bitcoin và các loại tiền ảo tương tự khác',
    lawNumber: '23/2014/TT-NHNN',
    issuingAgency: 'Ngân hàng Nhà nước Việt Nam',
    promulgationDate: new Date('2014-02-28'),
    effectiveDate: new Date('2014-03-01'),
    summary: 'Thông tư cấm các tổ chức, cá nhân phát hành, cung ứng và sử dụng Bitcoin và các loại tiền ảo tương tự.',
    content: 'Thông tư 23/2014/TT-NHNN cấm Bitcoin và tiền ảo. Quy định: Bitcoin không phải là phương tiện thanh toán hợp pháp tại Việt Nam. Cấm phát hành, cung cấp, sử dụng Bitcoin. Vi phạm bị xử phạt hành chính hoặc truy cứu trách nhiệm hình sự. Không công nhận các giao dịch bằng Bitcoin.'
  },
  {
    title: 'Quyết định 1255/QĐ-TTg: Phê duyệt Đề án phát triển ứng dụng công nghệ Blockchain tại Việt Nam đến năm 2025, định hướng đến năm 2030',
    lawNumber: '1255/QĐ-TTg',
    issuingAgency: 'Thủ tướng Chính phủ',
    promulgationDate: new Date('2020-09-18'),
    effectiveDate: new Date('2020-09-18'),
    summary: 'Quyết định phê duyệt đề án phát triển và ứng dụng công nghệ blockchain trong các lĩnh vực ưu tiên tại Việt Nam.',
    content: 'Quyết định 1255/QĐ-TTg về phát triển blockchain. Mục tiêu: Đưa Việt Nam vào top 10 nước dẫn đầu về blockchain tại châu Á. Ứng dụng blockchain trong: Ngân hàng, tài chính, y tế, giáo dục, logistics. Đào tạo nhân lực blockchain chất lượng cao. Xây dựng hệ sinh thái startup blockchain.'
  },
  {
    title: 'Bộ luật Hình sự 2015 (sửa đổi, bổ sung 2017): Quy định tội phạm trong lĩnh vực công nghệ cao',
    lawNumber: '100/2015/QH13',
    issuingAgency: 'Quốc hội',
    promulgationDate: new Date('2015-11-27'),
    effectiveDate: new Date('2018-01-01'),
    summary: 'Bộ luật quy định các tội phạm liên quan đến công nghệ thông tin, bao gồm lừa đảo sử dụng công nghệ cao, rửa tiền qua tiền điện tử.',
    content: 'Bộ luật Hình sự 2015 về tội phạm công nghệ cao. Điều 290: Chiếm đoạt tài sản bằng công nghệ cao, phạt 3-20 năm tù. Điều 299: Rửa tiền qua tiền điện tử, phạt 5-15 năm tù. Điều 171: Trộm cắp tài sản điện tử. Điều 318: Lừa đảo sử dụng ICO, tiền ảo.'
  },
  {
    title: 'Nghị định 15/2020/NĐ-CP: Quy định về quản lý đầu tư theo phương thức đối tác công tư',
    lawNumber: '15/2020/NĐ-CP',
    issuingAgency: 'Chính phủ',
    promulgationDate: new Date('2020-02-05'),
    effectiveDate: new Date('2020-03-25'),
    summary: 'Nghị định cho phép ứng dụng công nghệ blockchain trong quản lý dự án PPP và đấu thầu công khai.',
    content: 'Nghị định 15/2020/NĐ-CP về PPP và blockchain. Quy định: Khuyến khích sử dụng blockchain trong đấu thầu. Công khai thông tin dự án trên nền tảng blockchain. Quản lý hợp đồng thông minh. Giảm thiểu tham nhũng, nâng cao minh bạch.'
  },
  {
    title: 'Luật An toàn thông tin mạng 2015',
    lawNumber: '86/2015/QH13',
    issuingAgency: 'Quốc hội',
    promulgationDate: new Date('2015-11-19'),
    effectiveDate: new Date('2016-07-01'),
    summary: 'Luật quy định về bảo vệ an toàn thông tin mạng, áp dụng cho các hệ thống blockchain và ví điện tử.',
    content: 'Luật An toàn thông tin mạng 2015. Các quy định: Bảo mật dữ liệu trên blockchain. Yêu cầu bảo vệ ví điện tử. Phòng chống tấn công mạng vào sàn giao dịch crypto. Xử lý vi phạm an ninh mạng. Trách nhiệm của doanh nghiệp cung cấp dịch vụ blockchain.'
  },
  {
    title: 'Nghị định 83/2023/NĐ-CP: Quy định xử phạt vi phạm hành chính trong lĩnh vực thuế',
    lawNumber: '83/2023/NĐ-CP',
    issuingAgency: 'Chính phủ',
    promulgationDate: new Date('2023-12-15'),
    effectiveDate: new Date('2024-02-01'),
    summary: 'Nghị định quy định về xử phạt vi phạm thuế, bao gồm các quy định về kê khai thuế đối với thu nhập từ giao dịch tiền điện tử.',
    content: 'Nghị định 83/2023/NĐ-CP về xử phạt thuế liên quan crypto. Quy định: Thu nhập từ giao dịch crypto phải kê khai thuế. Phạt 10-20 triệu nếu không kê khai. Thuế TNCN 20% đối với lãi từ crypto. Sàn giao dịch phải báo cáo giao dịch lớn.'
  },
  {
    title: 'Quyết định 749/QĐ-TTg: Phê duyệt Chương trình Chuyển đổi số quốc gia đến năm 2025, định hướng đến năm 2030',
    lawNumber: '749/QĐ-TTg',
    issuingAgency: 'Thủ tướng Chính phủ',
    promulgationDate: new Date('2020-06-03'),
    effectiveDate: new Date('2020-06-03'),
    summary: 'Quyết định phê duyệt chương trình chuyển đổi số quốc gia với việc ứng dụng blockchain, AI và các công nghệ số.',
    content: 'Quyết định 749/QĐ-TTg về chuyển đổi số. Mục tiêu: 100% dịch vụ công trực tuyến mức độ 4. Ứng dụng blockchain trong chính quyền điện tử. Phát triển kinh tế số đạt 20% GDP. Đào tạo 100,000 chuyên gia công nghệ số. Xây dựng hạ tầng blockchain quốc gia.'
  }
];

async function main() {
  console.log('🌱 Seeding legal documents...\n');

  let created = 0;
  let skipped = 0;

  for (const doc of sampleDocuments) {
    try {
      // Check if exists
      const existing = await prisma.legalDocument.findFirst({
        where: { title: doc.title }
      });

      if (existing) {
        console.log(`⏭️  Skipped: ${doc.title}`);
        skipped++;
        continue;
      }

      // Create slug
      const slug = doc.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 100);

      let finalSlug = slug;
      let counter = 1;
      while (await prisma.legalDocument.findUnique({ where: { slug: finalSlug } })) {
        finalSlug = `${slug}-${counter}`;
        counter++;
      }

      await prisma.legalDocument.create({
        data: {
          ...doc,
          slug: finalSlug
        }
      });

      console.log(`✅ Created: ${doc.title}`);
      created++;

    } catch (error) {
      console.error(`❌ Error: ${doc.title}`, error);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   📄 Total: ${sampleDocuments.length}`);

  await prisma.$disconnect();
}

main();
